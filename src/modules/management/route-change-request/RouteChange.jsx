import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import StatusDropdown from './components/statusDropdown';
import CommonSearch from '../../../components/CommonSearch';
import { Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { TableHead, TablePagination, TableRow, TableSortLabel, CircularProgress } from '@mui/material';

const statusOptions = [
  { id: '3196ad71-4267-46dd-a962-6a07f0f77c0b', name: 'Accepted' },
  { id: 'aaf59ca8-b4ba-466f-bcaf-cf204b844efc', name: 'Pending' },
  { id: '1b13dd9a-e5ec-43d2-8676-a5811c194a25', name: 'Rejected' },
];

const allFields = [
  {
    key: 'employee_name',
    header: 'Employee Name',
    render: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
  },
  { key: 'old_vehicle_route_name', header: 'Old Vehicle Route Name' },
  { key: 'new_vehicle_route_name', header: 'New Vehicle Route Name' },
  { key: 'old_stop_address', header: 'Old Stop Address' },
  { key: 'new_stop_address', header: 'New Stop Address' },
  { key: 'route_change_request_status_id', header: 'Status ID' },
  { key: 'approved_by_name', header: 'Approved By Name' },
  { key: 'created_at', header: 'Created At' },
  { key: 'approved_at', header: 'Approved At' },
];

const columns = allFields.map((col) => {
  if (col.key === 'route_change_request_status_id') {
    return {
      ...col,
      render: (value, row, onStatusChange) => (
        <div style={{ minWidth: 150 }}>
          <StatusDropdown
            row={{
              ...row,
              statusValue: row.route_change_request_status_id,
              status: row.route_change_request_status_name,
            }}
            onStatusChange={onStatusChange}
            statusOptions={statusOptions}
          />
        </div>
      ),
    };
  }
  return col;
});

function RouteChange() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeChange, setRouteChange] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const getStatusLabel = (value) => statusOptions.find((opt) => opt.id === value)?.name || '';

  const handleStatusUpdate = (routeChangeReqID, newStatusValue) => {
    setRouteChange((prev) =>
      prev.map((row) =>
        row.id === routeChangeReqID || row.routeChangeReqID === routeChangeReqID
          ? {
              ...row,
              route_change_request_status_id: newStatusValue,
              route_change_request_status_name: getStatusLabel(newStatusValue),
            }
          : row
      )
    );
  };

  const formatRouteChangeData = (data) =>
    data && Array.isArray(data)
      ? data.map((item, idx) => {
          const formatted = { ...item };
          if (formatted.created_at) formatted.created_at = dayjs(formatted.created_at).format('YYYY-MM-DD');
          if (formatted.approved_at) formatted.approved_at = dayjs(formatted.approved_at).format('YYYY-MM-DD');
          if (!formatted.tableIndex) formatted.tableIndex = idx + 1;
          return formatted;
        })
      : [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await ApiService.get(APIURL.ROUTECHANGEREQ, { page: page + 1, limit, search: searchQuery });
        if (res && res.success) {
          setRouteChange(formatRouteChangeData(res.data.routeChanges));
          setTotalCount(
            typeof res.data?.pagination?.total === 'number'
              ? res.data.pagination.total
              : Array.isArray(res.data.routeChanges)
              ? res.data.routeChanges.length
              : 0
          );
        } else {
          setRouteChange([]);
          setTotalCount(0);
        }
      } catch {
        setRouteChange([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page, limit]);

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = !orderBy
    ? routeChange
    : [...routeChange].sort((a, b) => {
        const va = a[orderBy];
        const vb = b[orderBy];
        if (typeof va === 'string' && typeof vb === 'string')
          return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        if (typeof va === 'boolean' && typeof vb === 'boolean')
          return va === vb ? 0 : order === 'asc' ? (va ? -1 : 1) : va ? 1 : -1;
        if (typeof va === 'number' && typeof vb === 'number') return order === 'asc' ? va - vb : vb - va;
        return 0;
      });

  const paginatedData = sortedData;

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Route Change Request</h1>
        <CommonSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <TableContainer sx={{ maxHeight: 720, overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} align='left' sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : 'asc'}
                      onClick={() => handleSort(col.key)}>
                      {col.header}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align='center'>
                    <CircularProgress size={28} className='my-4' />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align='center'>
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, idx) => (
                  <TableRow key={row.id || row.tableIndex || idx}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className='whitespace-nowrap'>
                        {col.render
                          ? col.render(row[col.key], row, handleStatusUpdate)
                          : row[col.key] === null || row[col.key] === undefined
                          ? ''
                          : typeof row[col.key] === 'boolean'
                          ? row[col.key]
                            ? 'Yes'
                            : 'No'
                          : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 15, 20, 25, 30]}
          component='div'
          count={totalCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
}

export default RouteChange;
