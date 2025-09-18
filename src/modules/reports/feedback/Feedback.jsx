import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReportTable from '../../../components/table/ReportTable';
import { fetchFeedbackReport } from '../../../redux/feedBackReportSlice';

const columns = [
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'givenRating', header: 'Given Rating' },
  { key: 'review', header: 'Review' },
  { key: 'dateTime', header: 'Date Time' },
];

function Feedback() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { feedbackReportData, loading, error } = useSelector((state) => state?.feedbackReport);

  useEffect(() => {
    dispatch(fetchFeedbackReport({ page: page + 1, limit }));
  }, [dispatch, page, limit]);

  const tableData = Array.isArray(feedbackReportData?.feedbacks)
    ? feedbackReportData.feedbacks.map((item) => ({
        employeeName: item.employee
          ? [item.employee.first_name, item.employee.last_name].filter(Boolean).join(' ')
          : '',
        givenRating: typeof item.rating === 'number' ? item.rating.toFixed(1) : '',
        review: item.message || '',
        dateTime: item.created_at ? moment(item.created_at).format('YYYY-MM-DD hh:mm A') : '',
      }))
    : [];

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Feedback Report</h1>
      <ReportTable
        columns={columns}
        data={tableData}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={feedbackReportData?.pagination?.total || 0}
      />
    </div>
  );
}

export default Feedback;
