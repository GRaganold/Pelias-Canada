import { useEffect, useState, useRef } from "react"
import PropTypes from "prop-types"
import { parse } from "papaparse" // You can use papaparse for CSV parsing
import { RiArrowDropDownLine } from "react-icons/ri" // Import your icon component
import "./FAQ.css" // Import your CSS file

// AccordionItem component for displaying each FAQ item
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
	// useRef to dynamically adjust content height
	const contentHeight = useRef()

	return (
		<div className="wrapper">
			{/* Button to toggle visibility of FAQ question */}
			<button className={`question-container ${isOpen ? "active" : ""}`} onClick={onClick}>
				<p className="question-content">{question}</p> {/* Display FAQ question */}
				<RiArrowDropDownLine className={`arrow ${isOpen ? "active" : ""}`} /> {/* Icon for dropdown arrow */}
			</button>

			{/* Container for FAQ answer, adjusts height based on isOpen state */}
			<div ref={contentHeight} className="answer-container" style={isOpen ? { height: contentHeight.current.scrollHeight + "px" } : { height: "0px" }}>
				<p className="answer-content">{answer}</p> {/* Display FAQ answer */}
			</div>
		</div>
	)
}

// PropTypes for AccordionItem component props
AccordionItem.propTypes = {
	question: PropTypes.string.isRequired, // Required string prop for question
	answer: PropTypes.string.isRequired, // Required string prop for answer
	isOpen: PropTypes.bool.isRequired, // Required boolean prop to track open/close state
	onClick: PropTypes.func.isRequired, // Required function prop to handle click events
}


export default function FAQ() {
	const [jsonData, setJsonData] = useState(null) // State for parsed JSON data
	const [activeIndices, setActiveIndices] = useState({}) // State to track open FAQ items

	// Fetch CSV data and parse on component mount
	useEffect(() => {
		const fetchCSVData = async () => {
			try {
				// Example fetch CSV data (replace with your own method to fetch CSV)
				const response = await fetch("assets/FAQ.csv")
				const reader = response.body.getReader()
				const result = await reader.read()
				const decoder = new TextDecoder("utf-8")
				const csvString = decoder.decode(result.value)

				// Parse CSV string to array of objects
				const parsedData = parse(csvString, { header: true }).data

				// Filter out items with null or empty categories
				const filteredData = parsedData.filter(item => item.Categories && item.Categories.trim() !== "")

				// Group data by category
				const groupedData = filteredData.reduce((acc, item) => {
					const category = item.Categories // Assuming "Categories" is the field name
					if (!acc[category]) {
						acc[category] = []
					}
					acc[category].push(item)
					return acc
				}, {})

				// Initialize active indices state
				const initialActiveIndices = Object.keys(groupedData).reduce((acc, category, index) => {
					acc[index] = null // Initialize each category with null (closed)
					return acc
				}, {})

				// Set grouped JSON data and initial active indices to state
				setJsonData(groupedData)
				setActiveIndices(initialActiveIndices)
			} catch (error) {
				console.error("Error fetching or parsing CSV file:", error)
			}
		}

		fetchCSVData()
	}, []) // Empty dependency array ensures useEffect runs only once on mount

	// Function to handle click on FAQ item, toggles open/close state
	const handleItemClick = (categoryIndex, itemIndex) => {
		setActiveIndices(prevIndices => ({
			...prevIndices,
			[categoryIndex]: prevIndices[categoryIndex] === itemIndex ? null : itemIndex,
		}))
	}

	// Function to scroll to specific FAQ category
	const scrollToCategory = category => {
		const element = document.getElementById(category)
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" })
		}
	}

	return (
		<div className="container">
			<h1> Frequently Asked Questions</h1> {/* Title for FAQ section */}
			<div className="tableOfContents">
				<div className="tableOfContentsList">
					{jsonData &&
						Object.keys(jsonData).map((category, categoryIndex) => (
							<div className="tableOfContentsListItem"
								key={categoryIndex} onClick={() => scrollToCategory(category)}>{category}
							</div>
						))}
				</div>
			</div>

			{/* Render FAQ categories and items */}
			{jsonData &&
				Object.keys(jsonData).map((category, categoryIndex) => (
					<div key={categoryIndex} className="category-container">
						<h3 id={category}>{category}</h3> {/* Display FAQ category title */}
						<ul>
							{/* Render each FAQ item as an AccordionItem */}
							{jsonData[category].map((item, itemIndex) => (
								<AccordionItem
									key={itemIndex}
									question={item.Question} // Pass FAQ question to AccordionItem
									answer={item.Answer} // Pass FAQ answer to AccordionItem
									isOpen={activeIndices[categoryIndex] === itemIndex} // Track open/close state
									onClick={() => handleItemClick(categoryIndex, itemIndex)} // Handle click event
								/>
							))}
						</ul>
					</div>
				))}
		</div>
	)
}
