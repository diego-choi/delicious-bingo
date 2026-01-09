function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Delicious Bingo
          </h1>
          <p className="text-gray-600">맛집 도장깨기 빙고</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
          <p className="text-gray-600">
            맛집 도장깨기 빙고 게임을 시작해보세요.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
