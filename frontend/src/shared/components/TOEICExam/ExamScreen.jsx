import React, { useEffect, useRef, useState } from 'react'
import { Layout, Button, Modal, Typography } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import styles from '../../styles/Exam.module.css'
import QuestionNavigator from './QuestionNavigator'
import QuestionCard from '../TOEICExam/QuestionCard'
import { generateMockQuestionsFromParts } from './mockData'


const { Header, Content } = Layout
const { Text } = Typography

export default function ExamScreen({ selectedParts, durationMinutes, finishExam }){
const [questions, setQuestions] = useState(()=> generateMockQuestionsFromParts(selectedParts))
const [answers, setAnswers] = useState({})
const [currentIndex, setCurrentIndex] = useState(0)
const [timeLeft, setTimeLeft] = useState(durationMinutes*60)
const timerRef = useRef(null)
const [showSubmitModal, setShowSubmitModal] = useState(false)


useEffect(()=>{
timerRef.current = setInterval(()=>{
setTimeLeft(t=>{
if (t<=1){ clearInterval(timerRef.current); handleSubmit(true); return 0 }
return t-1
})
},1000)
return ()=> clearInterval(timerRef.current)
// eslint-disable-next-line react-hooks/exhaustive-deps
},[])

const onAnswer = (qid, option) => setAnswers(p=> ({...p, [qid]: option}))
const goToQuestionByIndex = (i) => { if (i>=0 && i<questions.length) setCurrentIndex(i) }


const handleSubmit = (auto=false) => {
clearInterval(timerRef.current)
// calculate mock scores
const total = questions.length
const correctCount = questions.reduce((acc,q)=> acc + (answers[q.id] && answers[q.id] === q.correct ? 1:0), 0)
const scorePercent = total ? (correctCount/total) : 0
// map to section scores (mock): Listening/Reading share, Speaking/Writing random
const listening = Math.round( (scorePercent * 495) * 0.6 )
const reading = Math.round( (scorePercent * 495) * 0.4 )
const speaking = Math.round( (Math.random()*200) )
const writing = Math.round( (Math.random()*200) )
const overall = listening + reading + Math.round((speaking+writing)/2)


const resultState = {
totalQuestions: total,
correctCount,
answers,
listening, reading, speaking, writing, overall,
detailTasks: [ { title: 'Task 1: Write a Sentence Based on a Picture', score: 4.5, feedback: 'Excellent accuracy and relevance' } ],
auto
}


// show modal then finish
setShowSubmitModal(true)
setTimeout(()=>{
setShowSubmitModal(false)
finishExam(resultState)
}, 1200)
}

const formattedTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`


const answeredCount = Object.keys(answers).length
const totalCount = questions.length
const progressPercent = totalCount ? Math.round((answeredCount/totalCount)*100) : 0


return (
<Layout className={styles.examLayout}>
<Header className={styles.header}>
<div className={styles.headerInner}>
<div style={{display:'flex', alignItems:'center'}}>
<MenuOutlined style={{color:'#fff'}}/>
<Text style={{color:'#fff', marginLeft:12}}>Online exam</Text>
</div>
<div className={styles.headerRight}>
<Button onClick={()=>handleSubmit(false)}>Submit</Button>
<Button style={{marginLeft:8}}>{formattedTime(timeLeft)}</Button>
<Text style={{color:'#fff', marginLeft:12}}>Demo User</Text>
<div style={{marginLeft:12}} className={styles.progressBox}>{answeredCount}/{totalCount}</div>
</div>
</div>
</Header>
<Content className={styles.contentArea}>
<div className={styles.examBody}>
<div className={styles.sideNav}><QuestionNavigator filteredQuestions={questions} currentIndex={currentIndex} answers={answers} goToQuestionByIndex={goToQuestionByIndex} /></div>
<div className={styles.questionArea}><QuestionCard question={questions[currentIndex]} currentIndex={currentIndex} totalCount={totalCount} answers={answers} onAnswer={onAnswer} goToQuestionByIndex={goToQuestionByIndex} handleSubmit={()=>handleSubmit(false)} progressPercent={progressPercent} /></div>
</div>
</Content>


<Modal open={showSubmitModal} title={"Submitting..."} footer={null} closable={false}>
<div style={{textAlign:'center', padding:20}}>Submitting your answers...</div>
</Modal>
</Layout>
)
}