import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommanTable from "../../../components/table/CommonTable";
import IModal from "../../../components/modal/Modal";
import PlantForm from "./components/PlantForm";
import { deletePlant, fetchPlantById, fetchPlants } from "../../../redux/plantSlice";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const columns = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  { key: "createdAt", header: "Created At" },
];

const Plant = () => {
  const dispatch = useDispatch();

  const { plants, pagination, loading } = useSelector((state) => state.plant);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchPlants({ page, limit: rowsPerPage, search: searchTerm }));
  }, [dispatch, page, rowsPerPage, searchTerm]);

const handleEdit = (row) => {
  // fetch the plant details by ID
  dispatch(fetchPlantById(row.plantID)).then(() => {
    setIsModalOpen(true);
    setSelectedRow(row)
  });
};

  const handleDelete = (row) => {
    const plantID = row.plantID;

    if (!window.confirm("Are you sure you want to delete this Plant ?")) return;

    dispatch(deletePlant(plantID))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        dispatch(fetchPlants({ page, limit: rowsPerPage, search: searchTerm }));
      })
      .catch((err) => {
        toast.error(err, {
          style: {
            width: "auto",
            maxWidth: "30vw",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
          },
        });
      });
  };

  const handleSearch = (value) => {
    setSearchTerm(value.trim());
    setPage(1);
  };

  const tableData = plants.map((item, idx) => {
    const formattedDate = dayjs(item.created_at).format("YYYY-MM-DD");
    return {
      id: (page - 1) * rowsPerPage + (idx + 1), // continuous numbering
      plantID: item.id,
      name: item.plant_name,
      createdAt: formattedDate,
    };
  });

  return (
    <div>
      <IModal toggleModal={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PlantForm
          action={selectedRow ? "EDIT" : "CREATE"}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
          data={selectedRow}
          fetchData={() =>
            dispatch(
              fetchPlants({ page, limit: rowsPerPage, search: searchTerm })
            )
          }
        />
      </IModal>
      <div className="w-full h-full p-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 text-[#07163d]">Plants</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="text-white bg-[#07163d] hover:bg-[#07163d] focus:outline-none font-medium rounded-sm text-sm px-5 py-2.5 text-center me-2 mb-2 cursor-pointer"
          >
            New Plant
          </button>
        </div>
        <div className="bg-white rounded-sm border-t-3 border-[#07163d] mt-4">
          <CommanTable
            columns={columns}
            data={tableData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSearch={handleSearch}
            totalCount={pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
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
