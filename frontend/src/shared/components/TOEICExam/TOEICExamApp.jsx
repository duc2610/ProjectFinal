import React, { useState } from 'react'
import ExamSelection from '../TOEICExam/ExamSelection'
import ExamScreen from '../TOEICExam/ExamScreen'
import { useNavigate } from 'react-router-dom'


export default function TOEICExamApp(){
const [selectedParts, setSelectedParts] = useState([1,2,3,4,5,6,7])
const [durationMinutes, setDurationMinutes] = useState(60)
const navigate = useNavigate()


// When exam finishes we navigate to /results with state
const handleFinish = (resultState) => {
// send via router state
navigate('/results', { state: resultState })
}


return (
<div>
{!sessionStorage.getItem('examStarted') ? (
<ExamSelection selectedParts={selectedParts} durationMinutes={durationMinutes} setSelectedParts={setSelectedParts} setDurationMinutes={setDurationMinutes} startExam={() => { sessionStorage.setItem('examStarted','1'); window.location.reload(); }} />
) : (
<ExamScreen selectedParts={selectedParts} durationMinutes={durationMinutes} finishExam={(res)=>{ sessionStorage.removeItem('examStarted'); handleFinish(res) }} />
)}
</div>
)
}