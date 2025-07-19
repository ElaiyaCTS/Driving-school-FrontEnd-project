import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';

import { useRole } from './AuthContext/AuthContext.jsx';

const URL = import.meta.env.VITE_BACK_URL;

const LearnerDashboard = () => {
  const { role, user } = useRole();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${URL}/api/dashboard/learner/${user.user_id}`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error('Error loading learner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (role === 'learner') fetchDashboard();
  }, [role]);

  const cardClass =
    "flex items-center justify-between p-4 border-2 border-blue-400 rounded-xl bg-white shadow-sm w-full";

  const labelClass = "text-gray-600 text-sm mt-1";
  const valueClass = "text-3xl font-bold text-blue-900";

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
        Learner Dashboard
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className={cardClass}>
            <div>
              <p className={valueClass}>
                {data?.totalCourse ?? '--'}
              </p>
              <p className={labelClass}>Total Course</p>
            </div>
            <FaBookOpen className="text-blue-600 text-3xl" />
          </div>
          <div className={cardClass}>
            <div>
              <p className={valueClass}>
                {data?.CompletedCourse ?? '--'}
              </p>
              <p className={labelClass}>Completed Course</p>
            </div>
            <FaBookOpen className="text-blue-600 text-3xl" />
          </div>
          <div className={cardClass}>
            <div>
              <p className={valueClass}>
                {data?.ActiveCourse ?? '--'}
              </p>
              <p className={labelClass}>ActiveCourse </p>
            </div>
            <FaBookOpen className="text-blue-600 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className={valueClass}>{data?.ActiveClasses ?? 0}</p>
              <p className={labelClass}>Over all ActiveClasses</p>
            </div>
            <FaCalendarAlt className="text-blue-600 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className={valueClass}>{data?.attendedClasses ?? 0}</p>
              <p className={labelClass}>Attended Classes</p>
            </div>
            <FaCheckCircle className="text-blue-600 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className={valueClass}>{data?.upcomingClasses ?? 0}</p>
              <p className={labelClass}>Upcoming Classes</p>
            </div>
            <FaClock className="text-blue-600 text-3xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
