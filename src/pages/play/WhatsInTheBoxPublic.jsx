import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function WhatsInTheBoxPublic() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/games/${gameId}`)
      .then((res) => {
        setGame(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error loading game.");
        setLoading(false);
      });
  }, [gameId]);

  const submitGuess = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/games/${gameId}/guess`, { guess })
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error submitting guess.");
      });
  };

  if (loading) return <p>Loading...</p>;
  if (!game) return <p>Game not found.</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>What's in the Box?</h2>
      <p>{game.description}</p>
      <input
        type="text"
        placeholder="Enter your guess"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        style={{ padding: "10px", width: "80%", margin: "10px 0" }}
      />
      <br />
      <button
        onClick={submitGuess}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Submit Guess
      </button>
      <p>{message}</p>
    </div>
  );
}