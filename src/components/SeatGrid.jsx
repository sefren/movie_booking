import React, { useState } from "react";
import { THEATER_CONFIG, SEAT_STATUS } from "../utils/constants";

const SeatGrid = ({
  selectedSeats = [],
  onSeatSelect,
  occupiedSeats = [],
  disabledSeats = [],
  className = "",
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Generate seat grid
  const generateSeats = () => {
    const seats = [];
    for (let rowIndex = 0; rowIndex < THEATER_CONFIG.rows.length; rowIndex++) {
      const row = THEATER_CONFIG.rows[rowIndex];
      const rowSeats = [];

      for (
        let seatNumber = 1;
        seatNumber <= THEATER_CONFIG.seatsPerRow;
        seatNumber++
      ) {
        const seatId = `${row}${seatNumber}`;
        rowSeats.push({
          id: seatId,
          row: row,
          number: seatNumber,
          rowIndex,
          seatIndex: seatNumber - 1,
        });
      }

      seats.push(rowSeats);
    }
    return seats;
  };

  const seatGrid = generateSeats();

  // Get seat status
  const getSeatStatus = (seatId) => {
    if (disabledSeats.includes(seatId)) return SEAT_STATUS.DISABLED;
    if (occupiedSeats.includes(seatId)) return SEAT_STATUS.OCCUPIED;
    if (selectedSeats.includes(seatId)) return SEAT_STATUS.SELECTED;
    return SEAT_STATUS.AVAILABLE;
  };

  // Get seat classes
  const getSeatClasses = (seat) => {
    const status = getSeatStatus(seat.id);
    const isHovered = hoveredSeat === seat.id;

    const baseClasses =
      "w-8 h-8 m-0.5 text-xs font-medium flex items-center justify-center transition-all duration-150 border";

    switch (status) {
      case SEAT_STATUS.SELECTED:
        return `${baseClasses} seat-selected`;
      case SEAT_STATUS.OCCUPIED:
        return `${baseClasses} seat-occupied`;
      case SEAT_STATUS.DISABLED:
        return `${baseClasses} bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed`;
      default:
        return `${baseClasses} seat-available ${isHovered ? "ring-2 ring-primary-900 ring-offset-1" : ""}`;
    }
  };

  // Handle seat click
  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat.id);

    if (status === SEAT_STATUS.OCCUPIED || status === SEAT_STATUS.DISABLED) {
      return;
    }

    if (onSeatSelect) {
      onSeatSelect(seat.id, status === SEAT_STATUS.AVAILABLE);
    }
  };

  // Create aisle space
  const createAisle = (rowIndex) => (
    <div key={`aisle-${rowIndex}`} className="w-4" />
  );

  return (
    <div className={`bg-white ${className}`}>
      {/* Screen */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <div className="inline-block bg-primary-100 px-8 py-2 border border-primary-200">
            <span className="text-sm font-medium text-primary-700">SCREEN</span>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent rounded"></div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center space-y-2">
        {seatGrid.map((row, rowIndex) => (
          <div
            key={THEATER_CONFIG.rows[rowIndex]}
            className="flex items-center"
          >
            {/* Row Label */}
            <div className="w-8 text-center text-sm font-medium text-primary-600 mr-4">
              {THEATER_CONFIG.rows[rowIndex]}
            </div>

            {/* Seats */}
            <div className="flex items-center">
              {row.map((seat, seatIndex) => (
                <React.Fragment key={seat.id}>
                  <button
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={() => setHoveredSeat(seat.id)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    className={getSeatClasses(seat)}
                    disabled={
                      getSeatStatus(seat.id) === SEAT_STATUS.OCCUPIED ||
                      getSeatStatus(seat.id) === SEAT_STATUS.DISABLED
                    }
                    aria-label={`Seat ${seat.id}`}
                    title={`Seat ${seat.id} - ${getSeatStatus(seat.id)}`}
                  >
                    {seat.number}
                  </button>

                  {/* Add aisle after specific seat number */}
                  {seatIndex + 1 === THEATER_CONFIG.aisleAfterSeat &&
                    createAisle(rowIndex)}
                </React.Fragment>
              ))}
            </div>

            {/* Row Label (Right) */}
            <div className="w-8 text-center text-sm font-medium text-primary-600 ml-4">
              {THEATER_CONFIG.rows[rowIndex]}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-primary-100">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 seat-available"></div>
            <span className="text-primary-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 seat-selected"></div>
            <span className="text-primary-600">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 seat-occupied"></div>
            <span className="text-primary-600">Occupied</span>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-primary-900 mb-2">
              Selected Seats ({selectedSeats.length})
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedSeats.map((seatId) => (
                <span
                  key={seatId}
                  className="inline-block px-2 py-1 bg-primary-900 text-white text-xs font-medium"
                >
                  {seatId}
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm text-primary-600">
              Total: {THEATER_CONFIG.currencySymbol}
              {(selectedSeats.length * THEATER_CONFIG.pricePerSeat).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
