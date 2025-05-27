import React from 'react'
import Link from 'next/link'

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <div>
        <ul>
          <Link href="llm">Go to LLM Page</Link>
        <br />
          <Link href="xitter">Go to Xitter Page</Link>
        </ul>
      </div>
    </div>
  )
}

export default HomePage