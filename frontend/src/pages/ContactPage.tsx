import { Typography } from 'antd'

const { Title, Paragraph } = Typography

function ContactPage() {
  return (
    <section className="static-page">
      <Title level={1}>Contact us</Title>
      <Paragraph>
        Have a question about your account? Reach out at{' '}
        <a href="mailto:support@collaberabank.example">support@collaberabank.example</a>.
      </Paragraph>
    </section>
  )
}

export default ContactPage
