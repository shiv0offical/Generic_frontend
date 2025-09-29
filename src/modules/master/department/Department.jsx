import dayjs from 'dayjs';
import { useState, useEffect, useRef } from 'react';
import IModal from '../../../components/modal/Modal';
import FilterOptions from './components/FilterOption';
import { useDispatch, useSelector } from 'react-redux';
import DepartmentForm from './components/DepartmentForm';
import CommonSearch from '../../../components/CommonSearch';
import CommanTable from '../../../components/table/CommonTable';
import { fetchDepartmentById, fetchDepartments } from '../../../redux/departmentSlice';
import { clearSelectedDepartment, deleteDepartment } from '../../../redux/departmentSlice';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'createdAt', header: 'Created At' },
];

// Sample fields for department import/export
const departmentSampleFields = [{ key: 'department_name', header: 'Department Name' }];

const Department = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

  const { departments, pagination, loading } = useSelector((state) => state.department);

  useEffect(() => {
    dispatch(fetchDepartments({ page, limit: rowsPerPage, search: searchQuery }));
  }, [dispatch, page, rowsPerPage, searchQuery]);

  const formattedDepartments = departments.map((item, idx) => {
    const formattedDate = dayjs(item.created_at).format('YYYY-MM-DD');
    return {
      id: (page - 1) * rowsPerPage + (idx + 1),
      departmentId: item.id,
      name: item.department_name,
      createdAt: formattedDate,
    };
  });

  const handleEdit = (row) => {
    dispatch(fetchDepartmentById(row.departmentId));
    setIsModalOpen(true);
    setSelectedRow(row);
  };

  const handleDelete = (row) => {
    if (!window.confirm('Are you sure you want to delete this Department ?')) return;

    dispatch(deleteDepartment(row.departmentId)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchDepartments({ page, limit: rowsPerPage, search: searchQuery }))
          .unwrap()
          .then((data) => {
            if (data.departments.length === 0 && page > 1)
              dispatch(fetchDepartments({ page: page - 1, limit: rowsPerPage, search: searchQuery }));
          });
      }
    });
  };

  // --- Department FilterOption handlers (like Vehicle) ---

  // Export departments as CSV
  const handleExport = async () => {
    try {
      const res = await dispatch(
        fetchDepartments({
          page: 1,
          limit: pagination?.total || 1000,
          search: searchQuery,
        })
      ).unwrap();
      const fullData = (res?.departments || []).map((item, idx) => ({
        id: idx + 1,
        name: item.department_name,
        createdAt: dayjs(item.created_at).format('YYYY-MM-DD'),
      }));

      if (!fullData.length) {
        alert('No data available to export.');
        return;
      }

      const cols = columns;
      const headers = cols.map((c) => c.header);

      const rows = fullData.map((row) => cols.map((col) => row[col.key] ?? ''));

      const csv = [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'departments.csv',
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export departments.');
    }
  };

  // Download sample CSV for department import
  const handleSample = () => {
    const headers = departmentSampleFields.map((f) => f.header);
    const values = departmentSampleFields.map(() => '');

    const csv = [headers, values]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'department_sample.csv',
    });
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle file upload for department import
  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Replace with your actual API call for department import
      // Example: const res = await ApiService.postFormData(`${APIURL.UPLOAD}?folder=department`, formData);
      // For now, just simulate success:
      alert('File uploaded successfully!');
      if (fileInputRef.current) fileInputRef.current.value = null;
      setFile(null);
      dispatch(fetchDepartments({ page, limit: rowsPerPage, search: searchQuery }));
    } catch (error) {
      alert('Upload failed.');
    }
  };

  // Reset file input and file state
  const handleFormReset = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div>
      <IModal
        toggleModal={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          dispatch(clearSelectedDepartment());
        }}>
        <DepartmentForm
          action={selectedRow ? 'EDIT' : 'CREATE'}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
            dispatch(clearSelectedDepartment());
          }}
          fetchData={() => dispatch(fetchDepartments({ page, limit: rowsPerPage, search: searchQuery }))}
          data={selectedRow}
        />
      </IModal>
      <div className='w-full h-full p-2'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold text-[#07163d]'>Departments (Total: {pagination?.total || 0})</h1>
          <div className='flex justify-between gap-4'>
            <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <button
              onClick={() => {
                setIsModalOpen(true);
              }}
              type='button'
              className='text-white bg-[#07163d] hover:bg-[#07163d] focus:outline-none font-medium rounded-sm text-sm px-5 py-2.5 text-center me-2 cursor-pointer'>
              New Department
            </button>
          </div>
        </div>

        <FilterOptions
          handleFormReset={handleFormReset}
          handleFileUpload={handleFileUpload}
          setFile={setFile}
          file={file}
          handleExport={handleExport}
          handleSample={handleSample}
          fileInputRef={fileInputRef}
        />
        <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
          <CommanTable
            columns={columns}
            data={formattedDepartments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            totalCount={pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(1);
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Department;
