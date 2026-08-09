import { useCallback, useEffect, useRef, useState } from "react";
import { Apple, Camera, Heart, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { FruitArcade } from "./game/FruitArcade";
import { useHandTracker, type HandPoint } from "./hooks/useHandTracker";

function cameraLabel(status: ReturnType<typeof useHandTracker>["status"]) {
  switch (status) {
    case "requesting":
      return "Camera permission";
    case "loading-model":
      return "Loading tracker";
    case "tracking":
      return "Camera live";
    case "fallback":
      return "Pointer fallback";
    default:
      return "Ready";
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<FruitArcade | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleHandPoint = useCallback((point: HandPoint) => {
    gameRef.current?.setHandPoint(point);
  }, []);

  const handTracker = useHandTracker({
    onPoint: handleHandPoint,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const arcade = new FruitArcade(canvas, {
      onScoreChange: setScore,
      onLivesChange: setLives,
      onGameOver: (totalScore) => {
        setFinalScore(totalScore);
        setGameOver(true);
      },
    });
    gameRef.current = arcade;
    arcade.start();

    return () => {
      arcade.destroy();
      gameRef.current = null;
    };
  }, []);

  const startGame = useCallback(async () => {
    setStarted(true);
    setGameOver(false);
    setFinalScore(0);
    gameRef.current?.reset();
    gameRef.current?.start();
    await handTracker.start();
  }, [handTracker]);

  const tryAgain = useCallback(() => {
    setGameOver(false);
    setFinalScore(0);
    gameRef.current?.reset();
    gameRef.current?.start();
    if (handTracker.status !== "tracking") {
      void handTracker.start();
    }
  }, [handTracker]);

  return (
    <main className="gameShell">
      <video ref={handTracker.videoRef} className="cameraFeed" aria-hidden="true" />
      <div className="dojoBackdrop" />
      <div className="cameraShade" />
      <canvas ref={canvasRef} className="gameCanvas" />

      <section className="hud" aria-label="Game status">
        <div className="scoreBadge">
          <Apple size={22} strokeWidth={2.4} />
          <span>{score}</span>
        </div>

        <div className="cameraBadge" data-status={handTracker.status}>
          <Camera size={18} strokeWidth={2.2} />
          <span>{cameraLabel(handTracker.status)}</span>
        </div>

        <div className="lifeBadge" aria-label={`${lives} lives remaining`}>
          {[0, 1, 2].map((life) => (
            <Heart
              key={life}
              size={24}
              fill={life < lives ? "currentColor" : "transparent"}
              className={life < lives ? "lifeIcon isActive" : "lifeIcon"}
              strokeWidth={2.4}
            />
          ))}
        </div>
      </section>

      {!started && (
        <section className="startOverlay" aria-label="Start game">
          <div className="brandLockup">
            <span className="brandMark">FN</span>
            <h1>
              <span className="wordFruit">Fruit </span>
              <span className="wordNinja">ninja</span>
            </h1>
          </div>
          <button className="primaryButton" type="button" onClick={() => void startGame()}>
            <Play size={22} fill="currentColor" />
            <span>Start Camera</span>
          </button>
          {handTracker.error && (
            <p className="inlineStatus">
              <TriangleAlert size={16} />
              <span>{handTracker.error}</span>
            </p>
          )}
        </section>
      )}

      {gameOver && (
        <section className="gameOverPanel" aria-label="Game over">
          <p className="overline">Game Over</p>
          <h2>{finalScore}</h2>
          <p className="scoreLabel">fruit slices</p>
          <button className="primaryButton" type="button" onClick={tryAgain}>
            <RotateCcw size={21} />
            <span>Try Again</span>
          </button>
        </section>
      )}

      {started && handTracker.error && !gameOver && (
        <aside className="toast" role="status">
          <TriangleAlert size={17} />
          <span>{handTracker.error}</span>
        </aside>
      )}
    </main>
  );
}

export default App;
