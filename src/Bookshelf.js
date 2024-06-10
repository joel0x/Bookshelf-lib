import React from 'react';

function Bookshelf({ books }) {
    return (
        <div className="bookshelf">
            <h2>Bookshelf</h2>
            <ul>
                {books.map((book, index) => (
                    <li key={index}>
                        {book.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Bookshelf;
