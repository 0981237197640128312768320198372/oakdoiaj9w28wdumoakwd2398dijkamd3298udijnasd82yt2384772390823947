import React from "react"
import SubTitle from "../SubTitle"
import NetflixTop10 from "../NetflixTop10"

const WeeklyTop10Section = () => {
  return (
    <section
      id='WeeklyTop10'
      className='w-full __container mt-24 flex flex-col'
    >
      <SubTitle title='Weekly Top 10' className='mb-16' />

      <NetflixTop10 />
    </section>
  )
}

export default WeeklyTop10Section
