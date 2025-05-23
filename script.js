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

let selected = {element:null, data:null, replaceMe:null, parent:null}
let jsonDatastructure



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

			root.appendChild(key)

			const elementContainer = document.createElement('div')
			elementContainer.className = 'object-value-container'
			elementContainer.appendChild(element)
			root.appendChild(elementContainer)
		}

		return root
	}

	const createKeyElement = (keyName)=>{
		const root = document.createElement('div')
		root.className = 'object-key-container'

		const text = document.createElement('p')
		text.className = 'object-key'
		text.innerHTML = keyName
		root.appendChild(text)

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

	const recursiveFunction = (object, visited = new Set(), replaceMe=(newValue)=>{json = newValue;return json}, parent=null)=>{
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
				return recursiveFunction(element, visited, (newValue)=>{object[index] = newValue; return json}, {data:object, replaceMe, parent})
			}))
			elementCreationFunction(arrayElement, object, replaceMe, parent)
			return arrayElement
		}else{
			const elements = []
			const keyElements = []
			for (const key in object) {
				if (!Object.prototype.hasOwnProperty.call(object, key)) {
					continue
				}
				const element = object[key];
				const keyElement = createKeyElement(key)
				elementCreationFunction(keyElement, key, ()=>{}, {data:object, replaceMe, parent})
				keyElements.push(keyElement)
				if (visited.has(element)) {
					const valueElement = createValueElement('visited')
					elementCreationFunction(valueElement, element, replaceMe, parent)
					elements.push(valueElement)
				}else{
					elements.push(recursiveFunction(element, visited, (newValue)=>{object[key] = newValue; return json}, {data:object, replaceMe, parent}))
				}
			}
			const objectElement = createObjectElement(elements, keyElements)
			elementCreationFunction(objectElement, object, replaceMe, parent)
			return objectElement
		}
	}

	return recursiveFunction(json)
}




function editableTextModule(element, callbackFunction=()=>{}){
    if (!(element instanceof HTMLElement)) {
        console.error(element)
        throw new Error("element is not instance of HTMLElement");
    }
	if (typeof callbackFunction !== 'function') {
		throw new Error("callbackFunction is not a function");
	}
    if (element.contentEditable !== 'true') {
        console.warn(element, `: is not content editable`)
    }

    let revertText = true
    let originalText = element.textContent

    element.addEventListener('focus',()=>{
        originalText = element.textContent
    })

    element.addEventListener('blur',()=>{
        if (!revertText) {
            return
        }
        //If revertText
        element.textContent = originalText
    })

    element.addEventListener('keydown',e=>{
        if (e.key !== 'Enter') {
            return
        }
        e.preventDefault()
        callbackFunction(element, element.textContent, originalText)
        originalText = element.textContent
        revertText = false
        element.blur()
    })
    
    element.addEventListener('input',()=>{
        revertText = true
    })
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




function changeKey(object, oldKey, newKey) {
	if (typeof object !== 'object' || Array.isArray(object)) {
		console.error(object)
		throw new Error("Invalid Object");
	}
	if (!object.hasOwnProperty(oldKey)) {
		throw new Error(`Key "${oldKey}" does not exist`);
	}
	if (object.hasOwnProperty(newKey)) {
		return object
	}
	return Object.fromEntries(Object.entries(object).map(([key,value])=>key === oldKey ? [newKey,value] : [key,value]))
}




function deserializeJSON(json) {
	console.log('deserializeJSON', JSON.parse(JSON.stringify(json)))
	addButtonContainer.style.display = 'none'
	setStringContainer.style.display = 'none'
	removeAllChildren(dataStructureContainer)
	dataStructureContainer.appendChild(createHTMLStructure(json, elementActions))
	
	function elementActions(element, data, replaceMe, parent) {
		if (!(element instanceof HTMLElement)) {
			console.error(element)
			throw new Error("element is not an instance of HTMLElement");
		}
		if (typeof replaceMe !== 'function') {
			console.error(replaceMe)
			throw new Error("replaceMe is not a function");
		}
		if (element.classList.contains('object-key-container')) {
			const keyElement = element.firstChild
			keyElement.setAttribute('contenteditable','true')
			editableTextModule(keyElement, (element, newContent, oldContent)=>{
				console.log(parent)
				jsonDatastructure = parent.replaceMe(changeKey(parent.data, oldContent, newContent))
				deserializeJSON(jsonDatastructure)
			})
		}
		element.addEventListener('click',e=>{
			e.stopPropagation()
			selected.element? selected.element.classList.remove('selected'): null;
			element.classList.add('selected')
			selected.element = element
			selected.data = data
			selected.replaceMe = replaceMe
			selected.parent = parent
			console.log('selected', selected)

			if (typeof data === 'object' && data !== null) {
				addButtonContainer.style.display = 'block'
			}else{
				addButtonContainer.style.display = 'none'
			}

			if (typeof data === 'string' && element.classList.contains('value')) {
				setStringContainer.style.display = 'block'
			}else{
				setStringContainer.style.display = 'none'
			}
		})
	}
}




fetchJSON('structure.json').then(response=>{
	console.log('original datastructure',response)
	jsonDatastructure = response
	
	deserializeJSON(jsonDatastructure)
	
	addString.addEventListener('click',()=>{
		const data = selected.data
		if (Array.isArray(data)) {
			data.push('')
		}else if (typeof data === 'object') {
			data['key'] = ''
		}else{
			console.error(data, selected)
			throw new Error("data is not an object");
		}
		deserializeJSON(jsonDatastructure)
	})

	addArray.addEventListener('click',()=>{
		const data = selected.data
		if (Array.isArray(data)) {
			data.push([])
		}else if (typeof data === 'object') {
			data['key'] = []
		}else{
			console.error(data, selected)
			throw new Error("data is not an object");
		}
		deserializeJSON(jsonDatastructure)
	})

	addDictionary.addEventListener('click',()=>{
		const data = selected.data
		if (Array.isArray(data)) {
			data.push({})
		}else if (typeof data === 'object') {
			data['key'] = {}
		}else{
			console.error(data, selected)
			throw new Error("data is not an object");
		}
		deserializeJSON(jsonDatastructure)
	})
	
	setStringButton.addEventListener('click',()=>{
		jsonDatastructure = selected.replaceMe(setString.value)
		deserializeJSON(jsonDatastructure)
	})
})




