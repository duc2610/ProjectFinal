import React from 'react'
import { Badge } from 'antd'
import styles from './Exam.module.css'


export default function QuestionNavigator({ filteredQuestions, currentIndex, answers, goToQuestionByIndex }){
const groups = {}
filteredQuestions.forEach((q, idx)=>{ if (!groups[q.partId]) groups[q.partId]=[]; groups[q.partId].push({q, idx}) })
return (
<div className={styles.sideInner}>
{Object.keys(groups).map(pid=> (
<div key={pid} className={styles.partGroup}>
<div className={styles.partGroupTitle}>Part {pid}</div>
<div className={styles.numbersGrid}>
{groups[pid].map(item=> (
<Badge key={item.q.id} count={answers[item.q.id] ? 1 : 0} offset={[6,-6]}>
<button className={`${styles.numBtn} ${item.idx === currentIndex ? styles.activeNum : ''}`} onClick={()=>goToQuestionByIndex(item.idx)}>{item.q.globalIndex}</button>
</Badge>
))}
</div>
</div>
))}
</div>
)
}