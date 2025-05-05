import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found in localStorage");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5001/api/journals/alljournals",
          {
            headers: { Authorization: token },
          }
        );

        console.log("API Response:", response.data);

        // Format and group entries by date
        const groupedEntries = response.data.reduce((acc, entry) => {
          const date = new Date(entry.timestamp).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long", // This will display the full weekday name
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });

          acc[date] = acc[date] || [];
          acc[date].push(entry);
          return acc;
        }, {});

        setEntries(groupedEntries);
        console.log("new entries", groupedEntries);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleCardClick = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Journal Entries</h2>

      {loading ? (
        <p className="text-center">Loading entries...</p>
      ) : Object.keys(entries).length > 0 ? (
        Object.keys(entries).map((date, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-primary">{date}</h4>
            <div className="row">
              {entries[date].map((entry, idx) => (
                <div key={idx} className="col-md-4 mb-3">
                  <div
                    className="card shadow-sm"
                    onClick={() => handleCardClick(entry)}
                  >
                    <div className="card-body">
                      <h5 className="card-title">Entry {idx + 1}</h5>
                      <p className="card-text">
                        {entry.text.length > 100
                          ? entry.text.substring(0, 100) + "..."
                          : entry.text}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <button className="btn btn-primary btn-sm">Read More</button>
                        <p className="mb-0">
                          {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No entries found.</p>
      )}

      {/* Bootstrap Modal */}
      {selectedEntry && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backdropFilter: "blur(5px)" }} // Adding blur effect to background
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Journal Entry</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setSelectedEntry(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>{selectedEntry.text}</p>
              </div>
              <div className="modal-footer d-flex justify-content-between w-100">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </button>

                <p className="mb-0">
                  {new Date(selectedEntry.timestamp).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    weekday: "long",
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
