import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommanTable from "../../../components/table/CommonTable";
import IModal from "../../../components/modal/Modal";
import DepartmentForm from "./components/DepartmentForm";
import dayjs from "dayjs";
import {
  clearSelectedDepartment,
  deleteDepartment,
  fetchDepartmentById,
  fetchDepartments,
} from "../../../redux/departmentSlice";

const columns = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  { key: "createdAt", header: "Created At" },
];

const Department = () => {
  const dispatch = useDispatch();

  const { departments, pagination, loading } = useSelector(
    (state) => state.department
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(
      fetchDepartments({ page, limit: rowsPerPage, search: searchQuery })
    );
  }, [dispatch, page, rowsPerPage, searchQuery]);

  const formattedDepartments = departments.map((item, idx) => {
    const formattedDate = dayjs(item.created_at).format("YYYY-MM-DD");
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
    if (!window.confirm("Are you sure you want to delete this Department ?"))
      return;

    dispatch(deleteDepartment(row.departmentId)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        // After delete, fetch updated list
        dispatch(
          fetchDepartments({ page, limit: rowsPerPage, search: searchQuery })
        )
          .unwrap()
          .then((data) => {
            // If no data in current page but still pages left, go to previous page
            if (data.departments.length === 0 && page > 1) {
              dispatch(
                fetchDepartments({
                  page: page - 1,
                  limit: rowsPerPage,
                  search: searchQuery,
                })
              );
            }
          });
      }
    });
  };

  const handleSearch = (value) => {
    setSearchQuery(value.trim());
    setPage(1);
  };

  return (
    <div>
      <IModal
        toggleModal={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          dispatch(clearSelectedDepartment());
        }}
      >
        <DepartmentForm
          action={selectedRow ? "EDIT" : "CREATE"}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
            dispatch(clearSelectedDepartment());
          }}
          fetchData={() =>
            dispatch(
              fetchDepartments({
                page,
                limit: rowsPerPage,
                search: searchQuery,
              })
            )
          }
          data={selectedRow}
        />
      </IModal>
      <div className="w-full h-full p-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 text-[#07163d]">
            Departments
          </h1>
          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            type="button"
            className="text-white bg-[#07163d] hover:bg-[#07163d] focus:outline-none font-medium rounded-sm text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer"
          >
            New Department
          </button>
        </div>
        <div className="bg-white rounded-sm border-t-3 border-[#07163d] mt-4">
          <CommanTable
            columns={columns}
            data={formattedDepartments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSearch={handleSearch}
            totalCount={pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
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
