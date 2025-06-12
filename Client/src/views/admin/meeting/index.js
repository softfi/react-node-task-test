import { useEffect, useState } from "react";
import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { getApi } from "services/api";
import { HasAccess } from "../../../redux/accessUtils";
import CommonCheckTable from "../../../components/reactTable/checktable";
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import MeetingAdvanceSearch from "./components/MeetingAdvanceSearch";
import AddMeeting from "./components/Addmeeting";
import CommonDeleteModel from "components/commonDeleteModel";
import { deleteManyApi } from "services/api";
import { toast } from "react-toastify";
import { fetchMeetingData } from "../../../redux/slices/meetingSlice";
import { useDispatch } from "react-redux";
import { fetchMeetingCustomFiled } from "../../../redux/slices/meetingCustomFieldSlice";

const Index = () => {
  const title = "Meeting";
  const navigate = useNavigate();
  const [action, setAction] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedValues, setSelectedValues] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
  const [searchboxOutside, setSearchboxOutside] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const [deleteMany, setDeleteMany] = useState(false);
  const [isLoding, setIsLoding] = useState(false);
  const [columns, setColumns] = useState([]);

  const [data, setData] = useState([]);
  const [displaySearchData, setDisplaySearchData] = useState(false);
  const [searchedData, setSearchedData] = useState([]);
  const [permission] = HasAccess(["Meetings"]);
  const [meetingData, setMeetingData] = useState([]);
  const dispatch = useDispatch();

  const fetchCustomDataFields = async () => {
    setIsLoding(true);
    const result = await dispatch(fetchMeetingCustomFiled());

    if (result?.payload?.status === 200) {
      setMeetingData(result?.payload?.data);

      const actionHeader = {
        Header: "Action",
        accessor: "action",
        isSortable: false,
        center: true,
        cell: ({ row }) => (
          <Text fontSize="md" fontWeight="900" textAlign={"center"}>
            <Menu isLazy>
              <MenuButton>
                <CiMenuKebab />
              </MenuButton>
              <MenuList
                minW="fit-content"
                transform="translate(1520px, 173px);"
              >
                {permission?.view && (
                  <MenuItem
                    py={2.5}
                    color={"green"}
                    onClick={() => navigate(`/metting/${row?.values._id}`)}
                    icon={<ViewIcon fontSize={15} />}
                  >
                    View
                  </MenuItem>
                )}
                {permission?.delete && (
                  <MenuItem
                    py={2.5}
                    color={"red"}
                    onClick={() => {
                      setDeleteMany(true);
                      setSelectedValues([row?.values?._id]);
                    }}
                    icon={<DeleteIcon fontSize={15} />}
                  >
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </Text>
        ),
      };

      const tempTableColumns = [
        {
          Header: "#",
          accessor: "_id",
          isSortable: false,
          width: 10,
        },
        ...(result?.payload?.data && result.payload.data.length > 0
          ? result.payload.data[0]?.fields
              ?.filter((field) => field?.isTableField && field?.isView)
              ?.map((field) => ({
                Header: field?.label,
                accessor: field?.name,
                cell: (cell) => (
                  <div className="selectOpt">
                    <Text
                      onClick={() => {
                        navigate(`/metting/${cell?.row?.original?._id}`);
                      }}
                      me="10px"
                      sx={{
                        "&:hover": {
                          color: "blue.500",
                          textDecoration: "underline",
                        },
                        cursor: "pointer",
                      }}
                      color="brand.600"
                      fontSize="sm"
                      fontWeight="700"
                    >
                      {cell?.value || "-"}
                    </Text>
                  </div>
                ),
              })) || []
          : []),
        ...(result?.payload?.data?.[0]?.fields || [])
          .filter((field) => field?.isTableField && !field?.isView)
          .map((field) => ({
            Header: field?.label,
            accessor: field?.name,
          })),
        ...(permission?.update || permission?.view || permission?.delete
          ? [actionHeader]
          : []),
      ];

      setColumns(tempTableColumns);
    } else {
      toast.error("Failed to fetch data", "error");
    }

    setIsLoding(false);
  };

  const fetchData = async () => {
    setIsLoding(true);
    const result = await dispatch(fetchMeetingData());
    console.log("result", result);
    if (result.payload.status === 200) {
      setData(result?.payload?.data?.data);
    } else {
      toast.error("Failed to fetch data", "error");
    }
    setIsLoding(false);
  };

  const handleDeleteMeeting = async (ids) => {
    try {
      setIsLoding(true);
      let response = await deleteManyApi("api/meeting/deleteMany", ids);
      if (response.status === 200) {
        setSelectedValues([]);
        setDeleteMany(false);
        setAction((pre) => !pre);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoding(false);
    }
  };

  // const [selectedColumns, setSelectedColumns] = useState([...tableColumns]);
  // const dataColumn = tableColumns?.filter(item => selectedColumns?.find(colum => colum?.Header === item.Header))

  useEffect(async () => {
    await fetchData();
    fetchCustomDataFields();
  }, [action]);

  return (
    <div>
      <CommonCheckTable
        title={title}
        isLoding={isLoding}
        columnData={columns ?? []}
        // dataColumn={dataColumn ?? []}
        allData={data ?? []}
        tableData={data}
        searchDisplay={displaySearchData}
        setSearchDisplay={setDisplaySearchData}
        searchedDataOut={searchedData}
        setSearchedDataOut={setSearchedData}
        tableCustomFields={[]}
        access={permission}
        // action={action}
        // setAction={setAction}
        // selectedColumns={selectedColumns}
        // setSelectedColumns={setSelectedColumns}
        // isOpen={isOpen}
        // onClose={onClose}
        onOpen={onOpen}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
        setDelete={setDeleteMany}
        AdvanceSearch={
          <Button
            variant="outline"
            colorScheme="brand"
            leftIcon={<SearchIcon />}
            mt={{ sm: "5px", md: "0" }}
            size="sm"
            onClick={() => setAdvanceSearch(true)}
          >
            Advance Search
          </Button>
        }
        getTagValuesOutSide={getTagValuesOutSide}
        searchboxOutside={searchboxOutside}
        setGetTagValuesOutside={setGetTagValuesOutside}
        setSearchboxOutside={setSearchboxOutside}
        handleSearchType="MeetingSearch"
      />

      <MeetingAdvanceSearch
        advanceSearch={advanceSearch}
        setAdvanceSearch={setAdvanceSearch}
        setSearchedData={setSearchedData}
        setDisplaySearchData={setDisplaySearchData}
        allData={data ?? []}
        setAction={setAction}
        setGetTagValues={setGetTagValuesOutside}
        setSearchbox={setSearchboxOutside}
      />
      <AddMeeting
        setAction={setAction}
        isOpen={isOpen}
        onClose={() => {
          fetchData();
          onClose();
        }}
      />

      {/* Delete model */}
      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => {
          fetchData();
          setDeleteMany(false);
        }}
        type="Meetings"
        handleDeleteData={handleDeleteMeeting}
        ids={selectedValues}
      />
    </div>
  );
};

export default Index;
