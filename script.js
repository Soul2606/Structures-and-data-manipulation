/*
One of the most important functions is the createHTMLStructure, it works by recursively searching through a json structure
and return an html element or array of elements if it is iterating through an object or array. The main thing is that it takes 
a function as a parameter and calls that function when each element is created. The parameters are the html element, the data used to construct the element and
a replaceMe function that can be used to mutate the original json structure used to generate these elements. Replace me simply replaces the data with the passed in value
*/



const dataStructureContainer = document.getElementById('data-structure-container')
const addButtonContainer = document.getElementById('add-button-container')
const addString = document.getElementById('add-string')
const addNumber = document.getElementById('add-number')
const addBool = document.getElementById('add-bool')
const addDictionary = document.getElementById('add-dictionary')
const addArray = document.getElementById('add-array')
const addNull = document.getElementById('add-null')
const setStringButton = document.getElementById('set-string-button')
const setStringContainer = document.getElementById('set-string-container')
const setString = document.getElementById('set-string')




async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching JSON:", error);
        return null; // Or handle the error appropriately
    }
}




function createHTMLStructure(json, elementCreationFunction=()=>{}) {
	if (typeof json !== 'object') {
		console.error(json)
		throw new Error("json is not a valid object");
	}
	if (typeof elementCreationFunction !== 'function') {
		console.error(elementCreationFunction)
		throw new Error("elementCreationFunction is not a function");
	}

	const createObjectElement = (elements, keys)=>{
		if (!Array.isArray(elements)) {
			throw new Error("elements is not an array");
		}
		if (!Array.isArray(keys)) {
			throw new Error("keys is not an array");
		}
		if (elements.length !== keys.length) {
			throw new Error("elements and keys are not equal length");
		}
		const root = document.createElement('div')
		root.className = 'object'

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i]
			const key = keys[i]

			const keyElement = document.createElement('p')
			keyElement.className = 'object-key'
			keyElement.innerHTML = key + '<span style="color: white; margin-left: 5px;">:</span>'
			root.appendChild(keyElement)

			const elementContainer = document.createElement('div')
			elementContainer.className = 'object-value'
			elementContainer.appendChild(element)
			root.appendChild(elementContainer)
		}

		return root
	}

	const createArrayElement = (elements)=>{
		if (!Array.isArray(elements)) {
			throw new Error("elements is not an array");
		}
		const root = document.createElement('div')
		root.className = 'array'

		const topBracket = document.createElement('div')
		topBracket.className = 'array-bracket'
		topBracket.style.height = '8px'
		topBracket.style.borderRadius = '3px 3px 0 0'
		topBracket.style.borderBottom = '0'
		root.appendChild(topBracket)

		const arrayGrid = document.createElement('div')
		arrayGrid.className = 'array-grid'
		root.appendChild(arrayGrid)

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i]

			const indexElement = document.createElement('p')
			indexElement.className = 'array-index'
			indexElement.innerHTML = i + '<span style="color: white; margin-left: 5px;">:</span>'
			arrayGrid.appendChild(indexElement)

			const elementContainer = document.createElement('div')
			elementContainer.className = 'array-value'
			elementContainer.appendChild(element)
			arrayGrid.appendChild(elementContainer)
		}

		const bottomBracket = document.createElement('div')
		bottomBracket.className = 'array-bracket'
		bottomBracket.style.height = '8px'
		bottomBracket.style.borderRadius = '0 0 3px 3px'
		bottomBracket.style.borderTop = '0'
		root.appendChild(bottomBracket)
		
		return root
	}

	const createValueElement = (value)=>{
		const root = document.createElement('p')
		root.className = 'value'
		switch (typeof value) {
		case 'string':
			root.classList.add('string')
		break;
		case 'number':
			root.classList.add('number')
		break;
		case 'bool':
			root.classList.add('bool')
		break;
		}
		if (typeof value === 'string') {
			root.textContent = `"${value}"`
		}else if (value instanceof HTMLElement) {
			root.appendChild(value)
		}else{
			root.textContent = String(value)
		}
		return root
	}

	const recursiveFunction = (object, visited = new Set(), replaceMe=(newValue)=>{json = newValue}, parent=null)=>{
		if (typeof object !== 'object' || object === null) {
			const valueElement = createValueElement(object)
			elementCreationFunction(valueElement, object, replaceMe, parent)
			return valueElement
		}
		visited.add(object)
		if (Array.isArray(object)) {
			const arrayElement = createArrayElement(object.map((element, index)=>{
				if (visited.has(element)) {
					const valueElement = createValueElement('visited')
					elementCreationFunction(valueElement, element, replaceMe, parent)
					return valueElement
				}
				return recursiveFunction(element, visited, (newValue)=>{object[index] = newValue}, {data:object, replaceMe, parent})
			}))
			elementCreationFunction(arrayElement, object, replaceMe, parent)
			return arrayElement
		}else{
			const elements = []
			const keys = []
			for (const key in object) {
				if (!Object.prototype.hasOwnProperty.call(object, key)) {
					continue
				}
				const element = object[key];
				keys.push(key)
				if (visited.has(element)) {
					const valueElement = createValueElement('visited')
					elementCreationFunction(valueElement, element, replaceMe, parent)
					elements.push(valueElement)
				}else{
					elements.push(recursiveFunction(element, visited, (newValue)=>{object[key] = newValue}, {data:object, replaceMe, parent}))
				}
			}
			const objectElement = createObjectElement(elements, keys)
			elementCreationFunction(objectElement, object, replaceMe, parent)
			return objectElement
		}
	}

	return recursiveFunction(json)
}




function removeAllChildren(element) {
	if (!(element instanceof HTMLElement)) {
		console.error(element)
		throw new Error("element is not instance of HTMLElement");
	}
	while (element.hasChildNodes()) {
		element.firstChild.remove()
	}
}




function deserializeJSON(json) {
	addButtonContainer.style.display = 'none'
	setStringContainer.style.display = 'none'
	removeAllChildren(dataStructureContainer)
	dataStructureContainer.appendChild(createHTMLStructure(json, elementActions))
	
	const selected = {element:null, data:null, replaceMe:null, parent:null}
	function elementActions(element, data, replaceMe, parent) {
		if (!(element instanceof HTMLElement)) {
			console.error(element)
			throw new Error("element is not an instance of HTMLElement");
		}
		if (typeof replaceMe !== 'function') {
			console.error(replaceMe)
			throw new Error("replaceMe is not a function");
		}
		element.addEventListener('click',e=>{
			e.stopPropagation()
			selected.element? selected.element.classList.remove('selected'): null;
			element.classList.add('selected')
			selected.element = element
			selected.data = data
			selected.replaceMe = replaceMe
			selected.parent = parent

			if (typeof data === 'object') {
				addButtonContainer.style.display = 'block'
			}else{
				addButtonContainer.style.display = 'none'
			}

			if (typeof data === 'string') {
				setStringContainer.style.display = 'block'
			}else{
				setStringContainer.style.display = 'none'
			}
		})
	}
	return selected
}




fetchJSON('structure.json').then(response=>{
	console.log(response)
	let jsonDatastructure = response
	
	let selected = deserializeJSON(jsonDatastructure)
	
	addString.addEventListener('click',()=>{
		const data = selected.data
		if (Array.isArray(data)) {
			data.push('')
		}else if (typeof data === 'object') {
			data['key'] = ''
		}else{
			console.error(data)
			throw new Error("data is not an object");
		}
		selected = deserializeJSON(jsonDatastructure)
	})
	
	setStringButton.addEventListener('click',()=>{
		selected.replaceMe(setString.value)
		selected = deserializeJSON(jsonDatastructure)
	})
})




