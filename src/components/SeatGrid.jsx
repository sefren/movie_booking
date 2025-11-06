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

    const generateSeats = () => {
        const seats = [];
        for (let rowIndex = 0; rowIndex < THEATER_CONFIG.rows.length; rowIndex++) {
            const row = THEATER_CONFIG.rows[rowIndex];
            const rowSeats = [];
            for (let seatNumber = 1; seatNumber <= THEATER_CONFIG.seatsPerRow; seatNumber++) {
                const seatId = `${row}${seatNumber}`;
                rowSeats.push({
                    id: seatId,
                    row,
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

    const getSeatStatus = (seatId) => {
        if (disabledSeats.includes(seatId)) return SEAT_STATUS.DISABLED;
        if (occupiedSeats.includes(seatId)) return SEAT_STATUS.OCCUPIED;
        if (selectedSeats.includes(seatId)) return SEAT_STATUS.SELECTED;
        return SEAT_STATUS.AVAILABLE;
    };

    const getSeatClasses = (seat) => {
        const status = getSeatStatus(seat.id);
        const isHovered = hoveredSeat === seat.id;

        // Better mobile sizing - min 32px touch target
        const base =
            "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 min-w-[32px] min-h-[32px] mx-0.5 my-0.5 text-[10px] sm:text-xs font-medium flex items-center justify-center transition-colors rounded touch-manipulation";

        switch (status) {
            case SEAT_STATUS.SELECTED:
                return `${base} seat-selected`;
            case SEAT_STATUS.OCCUPIED:
                return `${base} seat-occupied`;
            case SEAT_STATUS.DISABLED:
                return `${base} bg-surface-light border border-surface-border text-text-dim cursor-not-allowed opacity-50`;
            default:
                return `${base} seat-available ${isHovered ? "ring-1 ring-cinema-red" : ""}`;
        }
    };

    const handleSeatClick = (seat) => {
        const status = getSeatStatus(seat.id);
        if (status === SEAT_STATUS.OCCUPIED || status === SEAT_STATUS.DISABLED) return;
        onSeatSelect?.(seat.id, status === SEAT_STATUS.AVAILABLE);
    };


    return (
        <div className={className}>
            {/* Screen Indicator */}
            <div className="mb-4">
                <div className="text-center mb-3">
                    <span className="text-xs text-text-dim uppercase tracking-wider">Screen</span>
                </div>
                <div className="theater-screen" />
            </div>

            {/* Seat Grid Container - Horizontal scroll on mobile */}
            <div className="overflow-x-auto overflow-y-visible -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="inline-flex flex-col items-center gap-1.5 min-w-max py-2">
                    {seatGrid.map((row, rowIndex) => (
                        <div key={THEATER_CONFIG.rows[rowIndex]} className="flex items-center gap-2">
                            {/* Row Label (Left) */}
                            <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-text-muted flex-shrink-0">
                                {THEATER_CONFIG.rows[rowIndex]}
                            </div>

                            {/* Seats Row */}
                            <div className="flex items-center gap-0.5">
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
                                        >
                                            {seat.number}
                                        </button>

                                        {/* Aisle Gap */}
                                        {seatIndex + 1 === THEATER_CONFIG.aisleAfterSeat && (
                                            <div className="w-2 sm:w-3" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Row Label (Right) */}
                            <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-text-muted flex-shrink-0">
                                {THEATER_CONFIG.rows[rowIndex]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Hint for Mobile */}
            <div className="sm:hidden text-center mt-2">
                <p className="text-xs text-text-dim">← Swipe to view all seats →</p>
            </div>

            {/* Legend - Compact on mobile */}
            <div className="mt-4 pt-4 border-t border-surface-border/50">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 seat-available rounded flex-shrink-0" />
                        <span className="text-text-muted">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 seat-selected rounded flex-shrink-0" />
                        <span className="text-text-muted">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 seat-occupied rounded flex-shrink-0" />
                        <span className="text-text-muted">Occupied</span>
                    </div>
                </div>
            </div>

            {/* Selection Summary - Mobile friendly */}
            {selectedSeats.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-border/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
                        <p className="text-sm text-text-muted">
                            <span className="font-medium text-text">{selectedSeats.length}</span> seat{selectedSeats.length > 1 ? 's' : ''} selected
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-text">
                            {THEATER_CONFIG.currencySymbol}{(selectedSeats.length * THEATER_CONFIG.pricePerSeat).toFixed(0)}
                        </p>
                    </div>
                    <p className="text-xs text-text-dim text-center sm:text-left">{selectedSeats.join(", ")}</p>
                </div>
            )}
        </div>
    );
};

export default SeatGrid;
