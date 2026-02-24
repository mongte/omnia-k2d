import PriceChart from "@/components/PriceChart";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto py-4 px-6 sm:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-black text-xl cursor-default">
              D
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Deng Chart
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
              Live Cron
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-6 sm:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
            게임 재화 시세 동향
          </h2>
          <p className="text-lg leading-8 text-gray-600 dark:text-gray-400">
            하루 3번, 주기적으로 가장 신뢰할 만한 평균 단가를 수집하여 보여줍니다.<br className="hidden sm:block" />
            이상치(초저가 등)를 제외한 정확한 시세 추이를 모니터링하세요.
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 w-full items-start">
          <section className="w-full xl:col-span-3">
            <PriceChart />
          </section>

          <aside className="w-full xl:col-span-1 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                크롤링 스케줄
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <span className="font-medium text-gray-700 dark:text-gray-300">1차 수집</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">08:00 AM</span>
                </li>
                <li className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <span className="font-medium text-gray-700 dark:text-gray-300">2차 수집</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">01:00 PM</span>
                </li>
                <li className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <span className="font-medium text-gray-700 dark:text-gray-300">3차 수집</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">06:00 PM</span>
                </li>
              </ul>
            </div>

            {process.env.NODE_ENV !== "production" && (
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-base font-bold mb-3 text-indigo-900 dark:text-indigo-200 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  개발자 도구
                </h3>
                <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-5 leading-relaxed">
                  현재 기준의 최신 시세를 즉시 수집하고 DB에 적재합니다.
                </p>
                <a 
                  href="/api/cron/crawl" 
                  target="_blank" 
                  rel="noreferrer"
                  className="group w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200"
                >
                  수동 크롤링 실행
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
