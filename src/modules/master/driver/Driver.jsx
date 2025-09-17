import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterOptions from "./components/FilterOption";
import dayjs from "dayjs";
import IModal from "../../../components/modal/Modal";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import {
  changeDriverStatus,
  deleteDriver,
  fetchDrivers,
} from "../../../redux/driverSlice";
import { toast } from "react-toastify";

const Driver = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drivers, pagination, loading } = useSelector((state) => state.driver);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [filterData, setFilterData] = useState({
    fromDate: '',
    toDate: '',
  });
  const [file, setFile] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const columns = [
    { key: 'id', header: 'Sr No' },
    { key: 'driverName', header: 'driver Name' },
    { key: 'driverEmail', header: 'Driver Email' },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => (
        <button
          onClick={() => handleStatusClick(row)}
          className={`text-white px-2 py-1 rounded text-sm ${value === 1 ? 'bg-green-600' : 'bg-red-600'}`}>
          {value === 1 ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    { key: 'createdAt', header: 'Created At' },
  ];

  const formatDriver = (info) => {
    return info?.map((data, idx) => {
      const formattedDate = dayjs(data.created_at).format('YYYY-MM-DD');
      const formattedDob = dayjs(data.date_of_birth).format('YYYY-MM-DD');
      const formattedExpiryDate = dayjs(data.driving_licence_expire_date).format('YYYY-MM-DD');
      const formattedIssueDate = dayjs(data.driving_licence_issue_date).format('YYYY-MM-DD');
      return {
        id: idx + 1,
        driverName: data.first_name + ' ' + data.last_name,
        driverEmail: data.email,
        status: data.active,
        punchId: data.punch_id,
        phoneNumber: data.phone_number,
        createdAt: formattedDate,
        actual_id: data.id,
        dateOfBirth: formattedDob,
        drivingLicenceNo: data.driving_licence,
        drivingLicenceIssueDate: formattedIssueDate,
        drivingLicenceExpiryDate: formattedExpiryDate,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const driverValue = formatDriver(drivers);
  const totalCount = pagination?.total || 0;

  const fetchData = (pageNumber = page + 1,
    limit = rowsPerPage,
    filters = filterData) => {
      
    dispatch(
      fetchDrivers({
        page: pageNumber,
        limit: limit,
        search: "",
        from_date: filters?.fromDate,
        to_date: filters?.toDate,
      })
    );
  };

  const handleStatusClick = (driver) => {
    setSelectedDriver(driver);
    setIsStatusModalOpen(true);
  };

  const handleSort = (columnKey) => {
    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = [...driverValue].sort((a, b) => {
    if (!orderBy) return 0;
    const valueA = a[orderBy];
    const valueB = b[orderBy];

    if (typeof valueA === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const displayedData = sortedData;

  const handleView = (row) => {
    navigate('/master/driver/create', { state: row, action: 'VIEW' });
  };

  const handleEdit = (row) => {
    navigate('/master/driver/create', { state: row, action: 'EDIT' });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this Driver ?"))
      return;

    dispatch(deleteDriver(id))
      .unwrap()
      .then((msg) => {
        toast.success(msg || "Driver deleted successfully!", {
          position: "top-right",
        });
        //Always refetch after delete
        fetchData(1,rowsPerPage)
      })
      .catch((err) => {
        toast.error(err || "Failed to delete driver", {
          position: "top-right",
        });
      });
  };

const handleClickFilter = () => {
  setPage(0);
  setFilterData(prev => {
    const updated = { ...prev };
    fetchData(1, rowsPerPage, updated);
    return updated;
  });
};


  const handleFormReset = () => {
    const resetFilter = { fromDate: "", toDate: "" };
    setFilterData(resetFilter);
    setPage(0);
    fetchData(1, rowsPerPage,resetFilter);
  };

  const handleFileUpload = (event) => {
    console.log(file);
  };

  const handleExport = () => {
    const exportData = driverValue.map((row) => {
      return {
        "Sr No": row.id,
        "Driver Name": row.driverName,
        "Driver Email": row.driverEmail,
        Status: row.status === 1 ? "Active" : "Inactive",
        "Created At": row.createdAt,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet["!cols"] = [
      { wch: 8 }, // Sr No
      { wch: 25 }, // Driver Name
      { wch: 30 }, // Driver Email
      { wch: 12 }, // Status
      { wch: 18 }, // Created At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers");
    XLSX.writeFile(workbook, "drivers.xlsx");
  };

  const handleStatusChange = async () => {
    if (!selectedDriver) return;
    const newStatusId = selectedDriver.status === 1 ? 2 : 1;

    dispatch(
      changeDriverStatus({
        id: selectedDriver.actual_id,
        newStatusId,
      })
    )
      .unwrap()
      .then((msg) => {
        toast.success(msg, { position: "top-right" });
        setIsStatusModalOpen(false);
        setSelectedDriver(null);
        //Always refetch list after update
        fetchData(1,rowsPerPage)
      })
      .catch((err) => {
        toast.error(err || "Failed to update status", {
          position: "top-right",
        });
      });
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Driver</h1>
      </div>
      {isStatusModalOpen && selectedDriver && (
        <IModal toggleModal={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4 text-[#07163d]'>Change Driver Status</h2>
            <p className='mb-6'>
              Are you sure you want to change status of <strong>{selectedDriver.driverName}</strong> from{' '}
              <strong>{selectedDriver.status === 1 ? 'Active' : 'Inactive' }</strong> to{' '}
              <strong>{selectedDriver.status === 2 ? 'Active' : 'Inactive'}</strong>?
            </p>
            <div className='flex justify-end gap-3'>
              <button
                className='px-4 py-2 rounded bg-gray-300 text-[#07163d] hover:bg-gray-400'
                onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </button>
              <button
                className='px-4 py-2 rounded bg-[#07163d] text-white hover:bg-[#0a1a4a]'
                onClick={handleStatusChange}>
                Confirm
              </button>
            </div>
          </div>
        </IModal>
      )}

      <FilterOptions
        handleClickFilter={handleClickFilter}
        setFilterData={setFilterData}
        filterData={filterData}
        handleFormReset={handleFormReset}
        handleFileUpload={handleFileUpload}
        setFile={setFile}
        file={file}
        handleExport={handleExport}
      />
      <div className="bg-white rounded-sm border-t-3 border-[#07163d] mt-4">
        <TableContainer
          sx={{ maxHeight: 400, overflowX: "auto", position: "relative" }}
        >
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
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : displayedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align='center'>
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                displayedData.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell className='whitespace-nowrap' key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                    <TableCell key={row.id}>
                      <div className='flex flex-nowrap justify-center gap-1'>
                        <button
                          className='bg-blue-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                          onClick={() => handleView(row)}>
                          <RemoveRedEyeIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-green-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                          onClick={() => handleEdit(row)}>
                          <EditIcon fontSize='10px' />
                        </button>
                        <button
                          className='bg-red-400 p-2 text-white rounded-[3px] w-5 h-4 cursor-pointer flex justify-center items-center'
                          onClick={() => handleDelete(row.actual_id)}>
                          <DeleteIcon fontSize='10px' />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
};

export default Driver;
