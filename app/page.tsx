import { AIChatAssistant } from "@/components/ai-chat-assistant"

export default function AICompanion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4 font-heading">TELsTP AI Medical Assistant</h1>
          <p className="text-xl mb-8 font-body">Tawasol Egypt Life Science Technology Park</p>
          <p className="text-lg opacity-80 font-body">
            مساعدك الذكي للطب عن بُعد والإرشاد الصحي
            <br />
            Your AI companion for telemedicine and healthcare guidance
          </p>
          <div className="mt-8 text-sm opacity-60">
            <p>Powered by Mistral AI • Advanced Medical Intelligence • Arabic & English Support</p>
          </div>
        </div>
      </div>
      <AIChatAssistant />
    </div>
  )
}
