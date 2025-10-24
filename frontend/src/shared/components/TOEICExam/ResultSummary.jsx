import React from 'react'
import { Card, Typography } from 'antd'
import styles from '../../styles/Exam.module.css'


const { Text } = Typography


export default function ResultSummary({ result }){
return (
<div>
<Card>
<div className={styles.summaryItem}><Text strong>Overall Score</Text><div style={{marginTop:8}}><Text>{result.overall || 0}</Text></div></div>
<div className={styles.summaryItem}><Text>Listening ({result.listening || 0} points)</Text></div>
<div className={styles.summaryItem}><Text>Reading ({result.reading || 0} points)</Text></div>
<div className={styles.summaryItem}><Text>Speaking ({result.speaking || 0} points) - AI Scored</Text></div>
<div className={styles.summaryItem}><Text>Writing ({result.writing || 0} points) - AI Scored</Text></div>
</Card>
<Card style={{marginTop:12}}>
<div><Text strong>Test Information</Text></div>
<div style={{marginTop:6}}><Text type='secondary'>Test Date: {new Date().toLocaleDateString()}</Text></div>
<div style={{marginTop:6}}><Text type='secondary'>Duration: 2h 45m</Text></div>
</Card>
<Card style={{marginTop:12}}>
<div><Text strong>Performance Level</Text></div>
<div style={{marginTop:6}}><Text>Advanced (785-990)</Text></div>
</Card>
</div>
)
}