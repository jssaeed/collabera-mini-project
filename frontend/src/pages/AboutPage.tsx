import { Typography } from 'antd'

const { Title, Paragraph } = Typography

function AboutPage() {
  return (
    <section className="static-page">
      <Title level={1}>About us</Title>
      <Paragraph>
        Collabera Bank is a training project built to explore what modern online banking looks
        like — real-time balances, transaction history, and account management in one place.
      </Paragraph>
    </section>
  )
}

export default AboutPage
