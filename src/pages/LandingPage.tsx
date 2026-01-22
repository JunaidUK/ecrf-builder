import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-5xl m-0">eCRF Builder</h1>
      <p className="text-gray-500 m-0">Electronic Case Report Form Builder</p>
      <Link to="/demo">
        <button className="mt-8 px-12 py-4 text-xl font-semibold bg-indigo-500 text-white border-none rounded-lg cursor-pointer hover:bg-indigo-600 transition-colors">
          Demo
        </button>
      </Link>
    </div>
  )
}

export default LandingPage
