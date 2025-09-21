import dayjs from 'dayjs';
import { APIURL } from '../../../constants';
import { useEffect, useState } from 'react';
import { ApiService } from '../../../services';
import { useNavigate } from 'react-router-dom';
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

  const busOption = Array.from(
    new Map(plantData.map((item) => [item.vehicle_id, { label: item.name, value: item.vehicle_id }])).values()
  );

  const busRouteOptions = Array.from(
    new Map(plantData.map((item) => [item.route_id, { label: item.routeName, value: item.route_id }])).values()
  );

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
    navigate(`/master/factory-in-time-target/create`, { state: row, action: 'EDIT' });
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
      vehicle_id: filterData.bus,
      vehicle_route_id: filterData.busRoute,
      page,
      limit: rowsPerPage,
      search: searchTerm,
    };
    await fetchData(Filters);
  };

  const handleFormReset = () => {
    setFilterData({ bus: '', busRoute: '', company_id: companyID });
    setSearchTerm('');
    setPage(1);
    fetchData({ company_id: companyID, page: 1, limit: rowsPerPage, search: '' });
  };

  const handleExport = () => {
    // Add your export logic here
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
        <h1 className='text-2xl font-bold text-[#07163d]'>Factory In-Time Target</h1>
        <CommonSearch searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
      </div>

      <FilterOption
        handleClickFilter={handleClickFilter}
        filterData={filterData}
        busOption={busOption}
        busRouteOptions={busRouteOptions}
        handleFormReset={handleFormReset}
        setFilterData={setFilterData}
        handleExport={handleExport}
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
