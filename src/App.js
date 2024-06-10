import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Search from "./Search";
import Bookshelf from "./Bookshelf";

function App() {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bookshelf, setBookshelf] = useState([]);
  const [addedBooks, setAddedBooks] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    fetch("http://openlibrary.org/search.json?author=tolkien")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setSearchResults(data.docs);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const savedBookshelf = JSON.parse(localStorage.getItem("bookshelf"));
    const savedAddedBooks = JSON.parse(localStorage.getItem("addedBooks"));

    if (savedBookshelf) {
      setBookshelf(savedBookshelf);
    }

    if (savedAddedBooks) {
      setAddedBooks(new Set(savedAddedBooks));
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <video autoPlay muted loop className="background-video">
          <source src="../assests/trimmed.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <h2 className="loading-text">Loading please wait...</h2>
      </div>
    );
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  if (!data.docs) {
    return null;
  }

  const searchHandler = (search) => {
    setSearch(search);
    if (search !== "") {
      const newBooksList = data.docs.filter((i) => {
        return Object.values(i)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      });
      setSearchResults(newBooksList);
    } else {
      setSearchResults(data.docs);
    }
    setCurrentPage(1);
  };

  const addToBookshelf = (book) => {
    const updatedBookshelf = [...bookshelf, book];
    const updatedAddedBooks = new Set(addedBooks).add(book.key);

    setBookshelf(updatedBookshelf);
    setAddedBooks(updatedAddedBooks);

    localStorage.setItem("bookshelf", JSON.stringify(updatedBookshelf));
    localStorage.setItem(
      "addedBooks",
      JSON.stringify(Array.from(updatedAddedBooks))
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchResults.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  return (
    <Router>
      <div className="container">
        <nav className="nav">
          <Search term={search} searchKeyword={searchHandler} />{" "}
          <Link
            style={{
              textDecoration: "none",
              padding: 15,
              margin: 15,
              backgroundColor: "#ffc107",
              textAlign: "center",
              justifyContent: "center",
            }}
            to="/bookshelf"
          >
            Bookshelf
          </Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <ul className="list">
                  {currentItems.map((item, i) => (
                    <li key={i} className="list-item">
                      <i className="fa fa-book"></i>
                      &nbsp;
                      {item.title}
                      <div className="btnwrap">
                        <button
                          className="btnBookshelf"
                          onClick={() => addToBookshelf(item)}
                          disabled={addedBooks.has(item.key)}
                        >
                          {addedBooks.has(item.key)
                            ? "Added"
                            : "Add to Bookshelf"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            }
          />
          <Route path="/bookshelf" element={<Bookshelf books={bookshelf} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
