import React from 'react'
import { Card, Typography } from 'antd'
import styles from '../../styles/Exam.module.css'


const { Text } = Typography


export default function ResultCard({ task }){
return (
<div className={styles.taskRow}>
<div style={{flex:1}}>
<Text strong>{task.title}</Text>
<div style={{marginTop:8}}><Text type='secondary'>{task.feedback}</Text></div>
</div>
<div style={{width:120, textAlign:'center'}}>
<div className={styles.taskScore}>{task.score}/5</div>
</div>
</div>
)
}