import React from "react";

const Dashboard = () => {
  const modules = [
    {
      title: "Resume Analyzer",
      description: "Analyze your resume and identify skills and improvements.",
      icon: "📄",
    },
    {
      title: "AI Interview",
      description: "Practice technical and HR interview questions with AI.",
      icon: "🤖",
    },
    {
      title: "Coding Interview",
      description: "Improve your coding and problem-solving skills.",
      icon: "💻",
    },
    {
      title: "Voice Interview",
      description: "Practice answering interview questions using your voice.",
      icon: "🎤",
    },
    {
      title: "Group Discussion",
      description: "Practice GD topics and improve communication skills.",
      icon: "👥",
    },
    {
      title: "InternHelp",
      description: "Get learning and career assistance from your AI assistant.",
      icon: "🧠",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to InterZen 👋
          </h1>

          <p className="mt-2 text-gray-600">
            Prepare smarter. Practice better. Get interview ready.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Interviews</p>
            <h2 className="mt-2 text-3xl font-bold">0</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Readiness Score</p>
            <h2 className="mt-2 text-3xl font-bold">0%</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Practice Hours</p>
            <h2 className="mt-2 text-3xl font-bold">0</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Achievements</p>
            <h2 className="mt-2 text-3xl font-bold">0</h2>
          </div>
        </div>

        {/* Modules */}
        <div className="mt-10">
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            Practice Modules
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <div
                key={module.title}
                className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl">{module.icon}</div>

                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {module.title}
                </h3>

                <p className="mt-2 text-gray-600">
                  {module.description}
                </p>

                <button className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;