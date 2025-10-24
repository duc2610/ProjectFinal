import React from 'react'
import { Card, Checkbox, Button, Select, Typography } from 'antd'
import styles from './Exam.module.css'
import { MOCK_PARTS } from './mockData'


const { Title, Text } = Typography


export default function ExamSelection({ selectedParts, durationMinutes, setSelectedParts, setDurationMinutes, startExam }){
const togglePart = (partId)=>{
setSelectedParts(prev=> prev.includes(partId) ? prev.filter(x=>x!==partId) : [...prev, partId])
}
const selectAll = ()=> setSelectedParts(MOCK_PARTS.map(p=>p.id))


return (
<div className={styles.selectionContainer}>
<Card title={<div className={styles.cardTitle}><Title level={4}>TOEIC Test Selection</Title></div>}>
<Title level={5}>Select Test Parts</Title>
<div className={styles.partsGrid}>
{MOCK_PARTS.map(p=> (
<div key={p.id} className={styles.partCard}>
<div>
<Text strong>{p.title}</Text>
<div className={styles.partDesc}>{p.description}</div>
<div className={styles.partSmall}>{p.questions} questions</div>
</div>
<Checkbox checked={selectedParts.includes(p.id)} onChange={()=>togglePart(p.id)} />
</div>
))}
</div>
<div className={styles.controlsRow}>
<Button type='link' onClick={selectAll}>Select All</Button>
<div>
<span className={styles.durationLabel}>Duration:</span>
<Select value={durationMinutes} onChange={(v)=>setDurationMinutes(v)} style={{width:120}}>
{[30,45,60,90].map(m=> <Select.Option key={m} value={m}>{m} minutes</Select.Option>)}
</Select>
</div>
</div>
<div style={{textAlign:'center', marginTop:20}}>
<Button type='primary' size='large' onClick={startExam} disabled={!selectedParts.length}>Start Test</Button>
</div>
</Card>
</div>
)
}