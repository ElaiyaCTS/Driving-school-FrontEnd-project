import React, { useEffect, useState } from 'react';
import axios from 'axios';
const URL=import.meta.env.VITE_BACK_URL
import {useRole} from './AuthContext/AuthContext.jsx';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import {
  FaUsers, FaUserCheck,
} from 'react-icons/fa';
import { ImBooks } from "react-icons/im";

const DashboardAdmin = () => {
  
  const [summary, setSummary] = useState({
    totalLearners: 0,
    activeLearners: 0,
    inactiveLearners: 0,
    instructors: 0,
    staff: 0,
    courses: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${URL}/api/dashboard/admin`,{
           withCredentials: true,
        });
        const data = res.data;

        setSummary({
          totalLearners: data.totalLearners,
          activeLearners: data.activeLearners,
          inactiveLearners: data.inactiveLearners,
          instructors: data.instructors,
          staff: data.staff,
          courses: data.courses,
        });

        setMonthlyData(
          (data.monthlyAdmissions || []).map(item => ({
            month: item.month,
            learners: item.count,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cardClass =
    "flex items-center justify-between p-4 border-2 border-blue-400 rounded-xl bg-white shadow-sm w-full";

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {loading ? (
         <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{summary.totalLearners}</p>
                <p className="text-gray-600 text-sm mt-1">Total Learners</p>
              </div>
              <FaUsers className="text-blue-500 text-3xl" />
            </div>
            {/* <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{summary.activeLearners}</p>
                <p className="text-gray-600 text-sm mt-1">Active Learners</p>
              </div>
              <FaUserCheck className="text-blue-500 text-3xl" />
            </div> */}
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{summary.instructors}</p>
                <p className="text-gray-600 text-sm mt-1">Total Instructors</p>
              </div>
              <FaUsers className="text-blue-500 text-3xl" />
            </div>
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{summary.staff}</p>
                <p className="text-gray-600 text-sm mt-1">Total Staff</p>
              </div>
              <FaUsers className="text-blue-500 text-3xl" />
            </div>
            <div className={cardClass}>
              <div>
                <p className="text-3xl font-bold text-blue-600">{summary.courses}</p>
                <p className="text-gray-600 text-sm mt-1">Courses</p>
              </div>
              <ImBooks className="text-blue-500 text-3xl" />
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border border-blue-300 rounded-xl p-4">
            <h3 className="text-lg font-bold text-blue-600 mb-4"> Admissions</h3>
            <div className="w-full max-w-full mx-auto h-[360px] rounded-md border border-blue-200 ">
              <ResponsiveContainer  width="100%" height="100%">
                <BarChart data={monthlyData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="learners"
                    fill="#4F46E5"
                    name="No. of Admissions"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;
