import React, { useEffect, useState } from 'react'


export default function TestResult(){
const { state } = useLocation()
const navigate = useNavigate()
// if no state (user opened directly), create a mock result
const fallback = {
overall: 170,
listening: 90,
reading: 80,
speaking: 150,
writing: 170,
detailTasks: [ { title: 'Task 1: Write a Sentence Based on a Picture', score: 4.5, feedback: 'Excellent accuracy and relevance' } ]
}
const result = state || fallback


// count-up animation for overall
const [displayScore, setDisplayScore] = useState(0)
useEffect(()=>{
let start = 0
const end = result.overall
const step = Math.max(1, Math.floor(end/40))
const id = setInterval(()=>{
start += step
if (start >= end){ start = end; clearInterval(id) }
setDisplayScore(start)
}, 20)
return ()=> clearInterval(id)
},[result.overall])


return (
<div className={styles.resultPage}>
<div className={styles.topBar}><Title level={3} style={{color:'#fff'}}>TOEIC Test Results</Title><Button onClick={()=>navigate('/')}>Retake Test</Button></div>
<div className={styles.resultBody}>
<div className={styles.leftCol}><ResultSummary result={result} /></div>
<div className={styles.mainCol}>
<Title level={3}>Writing Section Results (AI Evaluated)</Title>
<div className={styles.scoreBox}>
<div className={styles.scoreNumber}>{displayScore}</div>
<div className={styles.scoreMeta}>Out of 200 points (Advanced Level)</div>
<div className={styles.aiBadge}>AI Neural Network Evaluation</div>
</div>


<Card style={{marginTop:20}}>
{result.detailTasks.map((t,i)=>( <ResultCard key={i} task={t} /> ))}
</Card>
</div>
</div>
</div>
)
}