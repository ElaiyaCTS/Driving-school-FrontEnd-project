import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaBookOpen, FaCalendarAlt, FaCheckCircle, FaClock,
} from 'react-icons/fa';

const LearnerDashboard = ({ learnerId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`/api/dashboard/learner/${learnerId}`);
        setData(res.data);
      } catch (err) {
        console.error('Error loading learner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (learnerId) fetchDashboard();
  }, [learnerId]);

  const cardClass =
    "flex items-center justify-between p-4 border-2 border-green-400 rounded-xl bg-white shadow-sm w-full";

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Learner Dashboard</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className={cardClass}>
            <div>
              <p className="text-lg font-semibold text-green-700">{data?.assignedCourse ?? '--'}</p>
              <p className="text-gray-600 text-sm mt-1">Assigned Course</p>
            </div>
            <FaBookOpen className="text-green-500 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className="text-3xl font-bold text-green-600">{data?.totalClasses ?? 0}</p>
              <p className="text-gray-600 text-sm mt-1">Total Classes</p>
            </div>
            <FaCalendarAlt className="text-green-500 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className="text-3xl font-bold text-green-600">{data?.attendedClasses ?? 0}</p>
              <p className="text-gray-600 text-sm mt-1">Attended Classes</p>
            </div>
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>

          <div className={cardClass}>
            <div>
              <p className="text-3xl font-bold text-green-600">{data?.upcomingClasses ?? 0}</p>
              <p className="text-gray-600 text-sm mt-1">Upcoming Classes</p>
            </div>
            <FaClock className="text-green-500 text-3xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
