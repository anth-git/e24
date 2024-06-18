import { useEffect, useState } from 'react'

import './App.css'

interface Match {
  team_1: string;
  team_2: string;
  score: [number, number];
  predictions: Map<string, Prediction>;
}

interface Prediction {
  user: string;
  score: [number, number];
}

const users = ["aha", "kkz", "pła"];

function App() {  

  const [results, setResults] = useState<Match[]>([]);
  const [totalPoints, setTotalPoints] = useState<Map<string, number>>(new Map());

  useEffect(() => {
      fetch('results.txt')
        .then(response => response.text())
        .then(data => {
          const results = parseResults(data);
          const totalPoints = getTotalPoints(results);
          setResults(results);
          setTotalPoints(totalPoints);
        })
        .catch(error => console.error('Error fetching the text file:', error));
  }, []);

  function parseResults(results: string): Match[]  {
    const lines = results.split('\n');

    const matches: Match[] =  lines.map(line => {
      const parts = line.split(' ');   

      return {
        team_1: parts[0],
        team_2: parts[1],
        score: parseScore(parts[2]),
        predictions: new Map([0, 1, 2].map(i => [
          users[i],
          { user: users[i], score: parseScore(parts[3 + i]) }
        ]))
      };
    });

    return matches;   
  }
  
  function parseScore(score: string): [number, number] {
    const parts = score.split(':');
    return [+parts[0], +parts[1]];
  }

  function getPoints(match: Match, prediction: Prediction): number {
    if (match.score[0] === prediction.score[0] && match.score[1] === prediction.score[1]) {
      return 6;
    }

    const scoreDiff = match.score[0] - match.score[1];
    const predictionDiff = prediction.score[0] - prediction.score[1];

    if (scoreDiff === predictionDiff) {
      return 4;
    }

    if (Math.sign(scoreDiff) === Math.sign(predictionDiff))
      return 2;

    return 0;
  }

  function getTotalPoints(matches: Match[]): Map<string, number> {    
    return new Map(users.map(user => [
      user,
      matches.reduce((sum, match) => sum + getPoints(match, match.predictions.get(user)!), 0)
    ]));
  }

  const header = (<>
    <span></span>
    <span></span>
    <span></span>
    <span className='header'>AH</span>
    <span title="sahar" className='header'>KKZ</span>
    <span className='header'>PŁA</span>
  </>);

  const table = results.map(match => {
      return (<>
          <span className='team_1'>{match.team_1}</span>
          <span className="score">{match.score[0]} - {match.score[1]}</span> 
          <span className='team_2'>{match.team_2}</span>

          {
            users
              .map(user => match.predictions.get(user)!)
              .map(prediction => {                
                const points = getPoints(match, prediction);
                return (<span className="prediction" data-points={points}>{prediction.score[0]}-{prediction.score[1]}</span>);
              }) 
          }
        </>)
    }
  );

  const footer = (<>
    <div className='footer'>
      <span></span>    
      <span>Points:</span>
      <span></span>
      {users.map(user => (<span>{ totalPoints.get(user) }</span>))}
      </div>
    </>)

  return (
    <div className='container'>
      <div className='table'>
        {header}
        {table}
        {footer}
      </div>
    </div>
  );
}

export default App
