import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StatsPage from './pages/StatsPage'
import CalculatorsPage from './pages/CalculatorsPage'
import { useWebSocket } from './hooks/useWebSocket'
import { useStats } from './hooks/useStats'
import { TelegramBotPage } from './pages/TelegramBotPage'
import { WidgetPage } from './pages/WidgetPage'
import ArticlePage from './pages/ArticlePage'
import {
  AboutPage,
  PrivacyPage,
  TermsPage,
  ResponsibleGamblingPage,
  ContactPage
} from './pages/FooterPages'

function App() {
  const { rounds, connected, connectionStatus } = useWebSocket()
  const { summary, distribution, recentRounds, loading, refetch } = useStats()

  return (
    <Layout
      connected={connected}
      connectionStatus={connectionStatus}
      summary={summary}
    >
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <HomePage
              rounds={rounds}
              summary={summary}
              distribution={distribution}
              recentRounds={recentRounds}
              loading={loading}
              refetch={refetch}
            />
          }
        />

        {/* Calculators Page */}
        <Route path="/calculators" element={<CalculatorsPage />} />

        {/* Telegram Bot Page */}
        <Route path="/telegram-bot" element={<TelegramBotPage />} />

        {/* Widget Page */}
        <Route path="/widget" element={<WidgetPage />} />

        {/* Footer Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/responsible-gambling" element={<ResponsibleGamblingPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Article Pages */}
        <Route path="/:slug" element={<ArticlePage />} />
      </Routes>
    </Layout>
  )
}

export default App
