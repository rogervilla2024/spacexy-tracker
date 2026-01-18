import React, { useState, useMemo, useCallback } from 'react';

/**
 * Dual-Axis Visualizer - Space XY
 * THE ONLY crash game with TWO separate multiplier axes!
 * Players can bet on X axis, Y axis, or BOTH
 */
export function DualAxisVisualizer({ rtp = 97 }) {
  const [betX, setBetX] = useState(5);
  const [betY, setBetY] = useState(5);
  const [targetX, setTargetX] = useState(2.0);
  const [targetY, setTargetY] = useState(2.0);
  const [simulationResults, setSimulationResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Generate random crash point for one axis
  const generateCrash = () => {
    const random = Math.random();
    const crash = Math.max(1.0, (rtp / 100) / (1 - random));
    return Math.min(crash, 1000);
  };

  // Calculate probabilities
  const calculations = useMemo(() => {
    const probX = ((rtp / 100) / targetX) * 100;
    const probY = ((rtp / 100) / targetY) * 100;

    // Both win probability (independent events)
    const probBoth = (probX / 100) * (probY / 100) * 100;

    // At least one wins
    const probAtLeastOne = (1 - ((1 - probX / 100) * (1 - probY / 100))) * 100;

    // Expected values
    const evX = (probX / 100) * betX * (targetX - 1) - ((1 - probX / 100) * betX);
    const evY = (probY / 100) * betY * (targetY - 1) - ((1 - probY / 100) * betY);
    const evTotal = evX + evY;

    // Potential outcomes
    const bothWin = betX * (targetX - 1) + betY * (targetY - 1);
    const onlyXWins = betX * (targetX - 1) - betY;
    const onlyYWins = betY * (targetY - 1) - betX;
    const bothLose = -(betX + betY);

    return {
      probX,
      probY,
      probBoth,
      probAtLeastOne,
      evX,
      evY,
      evTotal,
      outcomes: {
        bothWin: { profit: bothWin, prob: probBoth },
        onlyX: { profit: onlyXWins, prob: probX - probBoth },
        onlyY: { profit: onlyYWins, prob: probY - probBoth },
        bothLose: { profit: bothLose, prob: 100 - probAtLeastOne }
      }
    };
  }, [betX, betY, targetX, targetY, rtp]);

  // Simulate rounds
  const simulate = useCallback((count) => {
    setIsSimulating(true);
    const results = [];

    for (let i = 0; i < count; i++) {
      const crashX = generateCrash();
      const crashY = generateCrash();
      const wonX = crashX >= targetX;
      const wonY = crashY >= targetY;

      let profit = 0;
      if (wonX) profit += betX * (targetX - 1);
      else profit -= betX;
      if (wonY) profit += betY * (targetY - 1);
      else profit -= betY;

      results.push({
        crashX,
        crashY,
        wonX,
        wonY,
        profit,
        timestamp: Date.now() - (count - i) * 1000
      });
    }

    setSimulationResults(prev => [...results.reverse(), ...prev].slice(0, 100));
    setIsSimulating(false);
  }, [betX, betY, targetX, targetY]);

  // Stats from simulation
  const stats = useMemo(() => {
    if (simulationResults.length === 0) return null;

    const totalProfit = simulationResults.reduce((sum, r) => sum + r.profit, 0);
    const bothWins = simulationResults.filter(r => r.wonX && r.wonY).length;
    const onlyXWins = simulationResults.filter(r => r.wonX && !r.wonY).length;
    const onlyYWins = simulationResults.filter(r => !r.wonX && r.wonY).length;
    const bothLoses = simulationResults.filter(r => !r.wonX && !r.wonY).length;

    return {
      totalProfit,
      rounds: simulationResults.length,
      bothWins,
      onlyXWins,
      onlyYWins,
      bothLoses,
      winRate: ((bothWins + onlyXWins + onlyYWins) / simulationResults.length) * 100
    };
  }, [simulationResults]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🚀</span>
        Dual-Axis Visualizer
        <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded ml-2 animate-pulse">UNIQUE!</span>
      </h3>

      {/* Unique Feature Banner */}
      <div className="bg-indigo-900/50 border border-indigo-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <h4 className="text-indigo-400 font-bold">The ONLY Dual-Axis Crash Game!</h4>
            <p className="text-gray-300 text-sm mt-1">
              Space XY is unique because it has <strong className="text-yellow-400">TWO independent multipliers</strong>:
              X-axis and Y-axis. You can bet on one or both! Each axis crashes independently,
              creating 4 possible outcomes per round.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Coordinate Grid */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3">Space XY Coordinate System</h4>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64 bg-gray-950 rounded-lg overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="border border-gray-800" />
              ))}
            </div>

            {/* Axes */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-red-500" />

            {/* Target point */}
            <div
              className="absolute w-4 h-4 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{
                left: `${Math.min((targetX / 10) * 100, 100)}%`,
                bottom: `${Math.min((targetY / 10) * 100, 100)}%`
              }}
            />

            {/* Labels */}
            <div className="absolute bottom-2 right-2 text-blue-400 text-sm font-bold">X: {targetX}x</div>
            <div className="absolute top-2 left-2 text-red-400 text-sm font-bold">Y: {targetY}x</div>

            {/* Recent results visualization */}
            {simulationResults.slice(0, 10).map((result, idx) => (
              <div
                key={idx}
                className={`absolute w-2 h-2 rounded-full ${
                  result.wonX && result.wonY ? 'bg-green-400' :
                  result.wonX || result.wonY ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{
                  left: `${Math.min((result.crashX / 10) * 100, 95)}%`,
                  bottom: `${Math.min((result.crashY / 10) * 100, 95)}%`,
                  opacity: 1 - idx * 0.08
                }}
              />
            ))}
          </div>
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          Blue = X axis | Red = Y axis | Yellow dot = Target
        </div>
      </div>

      {/* Dual Bet Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* X Axis */}
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
          <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
            <span>➡️</span> X-Axis Bet
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Bet Amount ($)</label>
              <input
                type="number"
                value={betX}
                onChange={(e) => setBetX(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-blue-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Target Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={targetX}
                onChange={(e) => setTargetX(parseFloat(e.target.value) || 1.1)}
                className="w-full bg-gray-800 border border-blue-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Win Chance:</div>
              <div className="text-blue-400 font-bold">{calculations.probX.toFixed(1)}%</div>
              <div className="text-gray-400">Potential Win:</div>
              <div className="text-green-400 font-bold">+${(betX * (targetX - 1)).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Y Axis */}
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <span>⬆️</span> Y-Axis Bet
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Bet Amount ($)</label>
              <input
                type="number"
                value={betY}
                onChange={(e) => setBetY(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-red-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Target Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={targetY}
                onChange={(e) => setTargetY(parseFloat(e.target.value) || 1.1)}
                className="w-full bg-gray-800 border border-red-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Win Chance:</div>
              <div className="text-red-400 font-bold">{calculations.probY.toFixed(1)}%</div>
              <div className="text-gray-400">Potential Win:</div>
              <div className="text-green-400 font-bold">+${(betY * (targetY - 1)).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Outcomes */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3">4 Possible Outcomes Per Round</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-900/30 border border-green-600 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Both Win! 🎉</div>
            <div className="text-lg font-bold text-green-400">
              +${calculations.outcomes.bothWin.profit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{calculations.outcomes.bothWin.prob.toFixed(1)}%</div>
          </div>
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Only X Wins</div>
            <div className={`text-lg font-bold ${calculations.outcomes.onlyX.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {calculations.outcomes.onlyX.profit >= 0 ? '+' : ''}${calculations.outcomes.onlyX.profit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{calculations.outcomes.onlyX.prob.toFixed(1)}%</div>
          </div>
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Only Y Wins</div>
            <div className={`text-lg font-bold ${calculations.outcomes.onlyY.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {calculations.outcomes.onlyY.profit >= 0 ? '+' : ''}${calculations.outcomes.onlyY.profit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{calculations.outcomes.onlyY.prob.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Both Crash 💥</div>
            <div className="text-lg font-bold text-red-400">
              ${calculations.outcomes.bothLose.profit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{calculations.outcomes.bothLose.prob.toFixed(1)}%</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">At Least One Wins:</span>
            <span className="text-yellow-400 font-bold">{calculations.probAtLeastOne.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-400">Combined Expected Value:</span>
            <span className={`font-bold ${calculations.evTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {calculations.evTotal >= 0 ? '+' : ''}${calculations.evTotal.toFixed(3)}/round
            </span>
          </div>
        </div>
      </div>

      {/* Simulation */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => simulate(1)}
          disabled={isSimulating}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-bold"
        >
          LAUNCH 🚀
        </button>
        <button
          onClick={() => simulate(10)}
          disabled={isSimulating}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
        >
          10x
        </button>
        <button
          onClick={() => simulate(100)}
          disabled={isSimulating}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
        >
          100x
        </button>
        <button
          onClick={() => setSimulationResults([])}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
        >
          Reset
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h4 className="text-white font-medium mb-3">Simulation Results ({stats.rounds} rounds)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-400">Total Profit</div>
              <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Both Won</div>
              <div className="text-xl font-bold text-green-400">{stats.bothWins}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">X Only</div>
              <div className="text-xl font-bold text-blue-400">{stats.onlyXWins}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Y Only</div>
              <div className="text-xl font-bold text-red-400">{stats.onlyYWins}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Both Lost</div>
              <div className="text-xl font-bold text-gray-400">{stats.bothLoses}</div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="bg-indigo-900/30 border border-indigo-600/50 rounded-lg p-4">
        <h4 className="text-indigo-400 font-bold mb-2">Why Space XY is Unique</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-3xl mb-1">1️⃣</div>
            <div className="text-white font-bold">Aviator</div>
            <div className="text-gray-400">1 axis (single)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">2️⃣</div>
            <div className="text-white font-bold">JetX</div>
            <div className="text-gray-400">1 axis (3 slots)</div>
          </div>
          <div className="text-center bg-indigo-600/20 rounded-lg p-2">
            <div className="text-3xl mb-1">🌟</div>
            <div className="text-yellow-400 font-bold">Space XY</div>
            <div className="text-white">2 AXES!</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DualAxisVisualizer;
