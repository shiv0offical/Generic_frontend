import dayjs from 'dayjs';
import { APIURL } from '../../../constants';
import { useEffect, useState, useRef } from 'react';
import { ApiService } from '../../../services';
import { Link, useNavigate } from 'react-router-dom';
import FilterOption from './components/FilterOption';
import CommanTable from '../../../components/table/CommonTable';
import CommonSearch from '../../../components/CommonSearch';

const columns = [
  { key: 'id', header: 'S.#' },
  { key: 'name', header: 'Vehicle Number' },
  { key: 'routeName', header: 'Route Name' },
  { key: 'dayGeneral', header: 'Day General' },
  { key: 'nightGeneral', header: 'Night General' },
  { key: 'firstGeneral', header: 'First general' },
  { key: 'secondGeneral', header: 'Second General' },
  { key: 'thirdGeneral', header: 'Third General' },
  { key: 'updatedBy', header: 'Updated By' },
  { key: 'updatedOn', header: 'Updated On' },
];

// Sample fields for plant-in-time import/export
const plantInTimeSampleFields = [
  { key: 'vehicle_id', header: 'Vehicle ID' },
  { key: 'vehicle_route_id', header: 'Vehicle Route ID' },
  { key: 'day_general_start_time', header: 'Day General Start Time' },
  { key: 'night_general_start_time', header: 'Night General Start Time' },
  { key: 'first_shift_start_time', header: 'First Shift Start Time' },
  { key: 'second_shift_start_time', header: 'Second Shift Start Time' },
  { key: 'third_shift_start_time', header: 'Third Shift Start Time' },
];

function PlantInTime() {
  const companyID = localStorage.getItem('company_id');
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [filterData, setFilterData] = useState({ bus: '', busRoute: '', company_id: companyID });
  const [plantData, setPlantData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

  const formatPantInTime = (info, page, rowsPerPage) => {
    return info?.map((item, idx) => {
      const formattedDate = dayjs(item.updated_at).format('YYYY-MM-DD');
      return {
        id: (page - 1) * rowsPerPage + (idx + 1),
        plantId: item.id,
        name: item.vehicle?.vehicle_name || '',
        vehicle_id: item.vehicle_id,
        routeName: item.vehicle_route?.name || '',
        route_id: item.vehicle_route_id,
        dayGeneral: item.day_general_start_time,
        nightGeneral: item.night_general_start_time,
        firstGeneral: item.first_shift_start_time,
        secondGeneral: item.second_shift_start_time,
        thirdGeneral: item.third_shift_start_time,
        updatedBy: 'Admin-1',
        updatedOn: formattedDate,
      };
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, rowsPerPage, searchTerm]);

  const fetchData = async (customFilters = null) => {
    setLoading(true);
    const params = { company_id: companyID, page, limit: rowsPerPage, search: searchTerm, ...(customFilters || {}) };

    try {
      const res = await ApiService.get(APIURL.PLANTINTIME, params);
      if (res?.success) {
        setTotalCount(res.pagination?.total || res.data?.length || 0);
        const formatData = formatPantInTime(res.data, page, rowsPerPage);
        setPlantData(formatData);
      } else {
        setPlantData([]);
        setTotalCount(0);
      }
    } catch (error) {
      setPlantData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    navigate(`/master/plant-in-time/create`, { state: row, action: 'EDIT' });
  };

  const handleDelete = async (row) => {
    const plantID = row.plantId;
    if (!window.confirm('Are you sure you want to delete this Plant In Time Data?')) return;

    try {
      const response = await ApiService.delete(`${APIURL.PLANTINTIME}/${plantID}`);
      if (response.success) {
        alert('Plant in Time deleted successfully!');
        fetchData();
      } else {
        alert('Failed to delete Plant in Time.');
      }
    } catch (error) {
      alert('An error occurred while deleting.');
    }
  };

  const handleClickFilter = async () => {
    const Filters = {
      company_id: filterData.company_id,
      page,
      limit: rowsPerPage,
      search: searchTerm,
    };
    await fetchData(Filters);
  };

  // Export plant-in-time as CSV
  const handleExport = async () => {
    try {
      // Fetch all data for export
      const res = await ApiService.get(APIURL.PLANTINTIME, {
        company_id: companyID,
        page: 1,
        limit: totalCount || 1000,
        search: searchTerm,
      });
      const fullData = (res?.data || []).map((item, idx) => ({
        id: idx + 1,
        name: item.vehicle?.vehicle_name || '',
        routeName: item.vehicle_route?.name || '',
        dayGeneral: item.day_general_start_time,
        nightGeneral: item.night_general_start_time,
        firstGeneral: item.first_shift_start_time,
        secondGeneral: item.second_shift_start_time,
        thirdGeneral: item.third_shift_start_time,
        updatedBy: 'Admin-1',
        updatedOn: dayjs(item.updated_at).format('YYYY-MM-DD'),
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
        download: 'plant_in_time.csv',
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export Plant In Time data.');
    }
  };

  // Download sample CSV for plant-in-time import
  const handleSample = () => {
    const headers = plantInTimeSampleFields.map((f) => f.header);
    const values = plantInTimeSampleFields.map(() => '');

    const csv = [headers, values]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'plant_in_time_sample.csv',
    });
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }
    alert('File uploaded successfully!');
    if (fileInputRef.current) fileInputRef.current.value = null;
    setFile(null);
    fetchData();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold text-[#07163d]'>Plan In-Time (Total: {totalCount})</h1>
        <div className='flex gap-2'>
          <CommonSearch searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
          <Link to='/master/plant-in-time/create'>
            <button
              type='button'
              className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'>
              New Plant In-Time
            </button>
          </Link>
        </div>
      </div>

      <FilterOption
        handleExport={handleExport}
        handleSample={handleSample}
        handleFileUpload={handleFileUpload}
        setFile={setFile}
        file={file}
        fileInputRef={fileInputRef}
      />

      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <CommanTable
          columns={columns}
          data={plantData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          totalCount={totalCount}
          page={page - 1}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default PlantInTime;
