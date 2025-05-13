/*
One of the most important functions is the createHTMLStructure, it works by recursively searching through a json structure
and return an html element or array of elements if it is iterating through an object or array. The main thing is that it takes 
a function as a parameter and calls that function when each element is created. The parameters are the html element, the data used to construct the element and
a replaceMe function that can be used to mutate the original json structure used to generate these elements. Replace me simply replaces the data with the passed in value
*/



const dataStructureContainer = document.getElementById('data-structure-container')




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
			keyElement.textContent = key
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
		topBracket.style.height = '8px'
		topBracket.style.border = 'solid magenta 2px'
		topBracket.style.borderRadius = '3px 3px 0 0'
		topBracket.style.borderBottom = '0'
		root.appendChild(topBracket)

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i]
			const item = document.createElement('div')
			item.className = 'index-value'
			root.appendChild(item)

			const indexElement = document.createElement('p')
			indexElement.className = 'array-index'
			indexElement.textContent = i + ':'
			item.appendChild(indexElement)

			const elementContainer = document.createElement('div')
			elementContainer.className = 'array-value'
			elementContainer.appendChild(element)
			item.appendChild(elementContainer)
		}

		const bottomBracket = document.createElement('div')
		bottomBracket.style.height = '8px'
		bottomBracket.style.border = 'solid magenta 2px'
		bottomBracket.style.borderRadius = '0 0 3px 3px'
		bottomBracket.style.borderTop = '0'
		root.appendChild(bottomBracket)
		
		return root
	}

	const createValueElement = (value)=>{
		const root = document.createElement('p')
		root.className = 'value'
		root.textContent = String(value)
		return root
	}

	const recursiveFunction = (object, visited = new Set(), replaceMe=(newValue)=>{json = newValue})=>{
		if (typeof object !== 'object' || object === null) {
			const valueElement = createValueElement(object)
			elementCreationFunction(valueElement, object, replaceMe)
			return valueElement
		}
		visited.add(object)
		if (Array.isArray(object)) {
			const arrayElement = createArrayElement(object.map((element, index)=>{
				if (visited.has(element)) {
					const valueElement = createValueElement('visited')
					elementCreationFunction(valueElement, element, replaceMe)
					return valueElement
				}
				return recursiveFunction(element, visited, (newValue)=>{object[index] = newValue})
			}))
			elementCreationFunction(arrayElement, object, replaceMe)
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
					elementCreationFunction(valueElement, element, replaceMe)
					elements.push(valueElement)
				}else{
					elements.push(recursiveFunction(element, visited, (newValue)=>{object[key] = newValue}))
				}
			}
			const objectElement = createObjectElement(elements, keys)
			elementCreationFunction(objectElement, object, replaceMe)
			return objectElement
		}
	}

	return recursiveFunction(json)
}




fetchJSON('structure.json').then(response=>{
	console.log(response)
	dataStructureContainer.appendChild(createHTMLStructure(response, (valueElement, data, replaceMe)=>{
		if (!(valueElement instanceof HTMLElement)) {
			throw new Error("valueElement is not an instance of HTMLElement");
		}
		if (typeof replaceMe !== 'function') {
			console.error(replaceMe)
			throw new Error("replaceMe is not a function");
		}
		valueElement.addEventListener('click',e=>{
			e.stopPropagation()
			console.log('click',valueElement, data, replaceMe)
			replaceMe('kill')
			console.log(response)
		})
	}))
})