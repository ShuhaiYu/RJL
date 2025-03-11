import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

export default function SendReminderButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSendReminders = async () => {
    setLoading(true)
    setError(null)
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/test/send-reminders`)
      toast.success('Reminders sent successfully!')
    } catch (err) {
      console.error('Failed to send reminders:', err)
      setError(err.response?.data?.message || 'Failed to send reminders')
      toast.error('Failed to send reminders.')
    }
    setLoading(false)
  }

  return (
    <div className="p-5 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Send Reminder</h2>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        This button simulates sending an email reminder immediately.
        (Normally done at 4am by CRON)
      </p>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
        onClick={handleSendReminders}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reminder'}
      </button>
    </div>
  )
}
