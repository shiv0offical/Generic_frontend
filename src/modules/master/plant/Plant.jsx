import dayjs from 'dayjs';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import PlantForm from './components/PlantForm';
import IModal from '../../../components/modal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import CommonSearch from '../../../components/CommonSearch';
import CommanTable from '../../../components/table/CommonTable';
import { deletePlant, fetchPlantById, fetchPlants } from '../../../redux/plantSlice';
import FilterOption from './components/FilterOption';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'createdAt', header: 'Created At' },
];

// Sample fields for plant import/export
const plantSampleFields = [{ key: 'plant_name', header: 'Plant Name' }];

const Plant = () => {
  const dispatch = useDispatch();

  const { plants, pagination, loading } = useSelector((state) => state.plant);

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPlants({ page, limit: rowsPerPage, search: searchTerm }));
  }, [dispatch, page, rowsPerPage, searchTerm]);

  const handleEdit = (row) => {
    dispatch(fetchPlantById(row.plantID)).then(() => {
      setIsModalOpen(true);
      setSelectedRow(row);
    });
  };

  const handleDelete = (row) => {
    const plantID = row.plantID;

    if (!window.confirm('Are you sure you want to delete this Plant ?')) return;

    dispatch(deletePlant(plantID))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        dispatch(fetchPlants({ page, limit: rowsPerPage, search: searchTerm }));
      })
      .catch((err) => {
        toast.error(err, {
          style: { width: 'auto', maxWidth: '30vw', whiteSpace: 'pre-line', wordBreak: 'break-word' },
        });
      });
  };

  // Export plants as CSV
  const handleExport = async () => {
    try {
      const res = await dispatch(
        fetchPlants({
          page: 1,
          limit: pagination?.total || 1000,
          search: searchTerm,
        })
      ).unwrap();
      const fullData = (res?.plants || []).map((item, idx) => ({
        id: idx + 1,
        name: item.plant_name,
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
        download: 'plants.csv',
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export plants.');
    }
  };

  // Download sample CSV for plant import
  const handleSample = () => {
    const headers = plantSampleFields.map((f) => f.header);
    const values = plantSampleFields.map(() => '');

    const csv = [headers, values]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'plant_sample.csv',
    });
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle file upload for plant import
  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }
    // Replace with your actual API call for plant import
    // Example: const res = await ApiService.postFormData(`${APIURL.UPLOAD}?folder=plant`, formData);
    // For now, just simulate success:
    alert('File uploaded successfully!');
    if (fileInputRef.current) fileInputRef.current.value = null;
    setFile(null);
    dispatch(fetchPlants({ page, limit: rowsPerPage, search: searchTerm }));
  };

  // Reset file input and file state
  const handleFormReset = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const tableData = plants.map((item, idx) => {
    const formattedDate = dayjs(item.created_at).format('YYYY-MM-DD');
    return {
      id: (page - 1) * rowsPerPage + (idx + 1),
      plantID: item.id,
      name: item.plant_name,
      createdAt: formattedDate,
    };
  });

  return (
    <div>
      <IModal
        toggleModal={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRow(null);
        }}>
        <PlantForm
          action={selectedRow ? 'EDIT' : 'CREATE'}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
          data={selectedRow}
          fetchData={() => dispatch(fetchPlants({ page, limit: rowsPerPage, search: searchTerm }))}
        />
      </IModal>
      <div className='w-full h-full p-2'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold text-[#07163d]'>Plants (Total: {pagination?.total || 0})</h1>
          <div className='flex gap-4 items-center'>
            <CommonSearch searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
            <button
              onClick={() => setIsModalOpen(true)}
              type='button'
              className='text-white bg-[#07163d] hover:bg-[#07163d] focus:outline-none font-medium rounded-sm text-sm px-5 py-2.5 text-center me-2 cursor-pointer'>
              New Plant
            </button>
          </div>
        </div>
        <FilterOption
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
            data={tableData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            totalCount={pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(newPage) => setPage(newPage + 1)}
            loading={loading}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Plant;
