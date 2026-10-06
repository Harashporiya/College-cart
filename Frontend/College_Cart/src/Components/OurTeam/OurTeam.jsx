import React from "react";
import jatinImg from '../../assets/jatin.webp';
import harashImg from '../../assets/harash.webp';
import hardikImg from '../../assets/hardik.webp';
import jyotiImg from '../../assets/jyoti.webp'
import styles from "./OurTeam.module.css";
import Header from '../Header/Header';
import Footer from "../Footer/Footer";
import useScrollReveal from '../../util/useScrollReveal';
const teamMembers = [
  {
    name: "Harash Poriya",
    role: "Full Stack Developer",
    bio: "Harash manages the server, APIs, and database to ensure secure and efficient data flow.",
    image: harashImg,
    tasks: [
      "Developed Chatbot for user communication",
      "Implemented user authentication system",
      "Optimized database queries for performance",
      "Set up cloud infrastructure"
    ]
  },
  {
    name: "Jatin Pathania",
    role: "Full Stack Developer",
    bio: "Jatin builds responsive interfaces for a smooth and intuitive user experience on College Cart.",
    image: jatinImg,
    tasks: [
      "Made website responsive",
      "Implemented cart functionality",
      "Created user dashboard components",
      "Optimized frontend performance"
    ]
  },
  {
    name: "Hardik Mahajan",
    role: "UI/UX Designer",
    bio: "Hardik designs user-friendly interfaces that are visually appealing and easy for students to navigate.",
    image: hardikImg,
    tasks: [
      "Added animations and transitions",
      "Created style guide and design system",
      "Conducted user testing sessions"
    ]
  },
  {
    name: "Jyoti Thakur",
    role: "Documentation Specialist & Frontend Support",
    bio: "Jyoti manages technical docs and also helped design the Electronics and Groceries pages.",
    image: jyotiImg,
    tasks: [
      "Made Electronics page UI",
      "Styled the Groceries section",
      "Created Project PPTs",
      "Prepared technical specifications"
    ]
  }  
];

const OurTeam = () => {
  const revealRef = useScrollReveal({ stagger: 90 });

  return (
    <div className={styles.container}>
      <Header showSearch={false} showMiddleHeader={true} isProductsPage={false}/>
      <div className={styles.header}>
        <h1 className={styles.title}>Our Team</h1>
        <p className={styles.description}>
          <strong>College Cart</strong> is a dedicated platform designed exclusively for college students to buy, sell, and exchange products and essentials within their campus network. From second-hand textbooks, groceries and smartphones to gadgets and lab equipment, we make the process safe, smart, and sustainable.
        </p>
      </div>

      <div className={styles.missionSection}>
        <h2 className={styles.subheading}>Our Vision & Mission</h2>
        <p className={styles.missionText}>
          Our mission is to simplify student life by creating a connected marketplace that fosters sustainability, affordability, and community. We believe in reusing resources, minimizing waste, and empowering students to support each other through tech-driven solutions.
        </p>
      </div>

      <div className={styles.teamSection}>
        <h2 className={styles.subheading}>Meet the Team</h2>
        <div className={styles.teamGrid} ref={revealRef}>
          {teamMembers.map((member) => (
            <div key={member.name} className={`${styles.card} cc-reveal`}>
              <div className={styles.memberImageContainer}>
                <img
                  src={member.image}
                  alt={member.name}
                  className={styles.memberImage}
                  width="160"
                  height="160"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
                <p className={styles.memberBio}>{member.bio}</p>
                
                <div className={styles.tasksContainer}>
                  <div>
                    <h4 className={styles.tasksTitle}>Key Contributions:</h4>
                    <ul className={styles.tasksList}>
                      {member.tasks.map((task) => (
                        <li key={task} className={styles.taskItem}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OurTeam;
