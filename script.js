

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





function createHTMLStructure(json) {
	if (typeof json !== 'object') {
		console.error(json)
		throw new Error("json is not a valid object");
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
			const item = document.createElement('div')
			item.className = 'key-value-pair'
			root.appendChild(item)

			const keyElement = document.createElement('p')
			keyElement.className = 'object-key'
			keyElement.textContent = key
			item.appendChild(keyElement)

			const elementContainer = document.createElement('div')
			elementContainer.className = 'object-value'
			elementContainer.appendChild(element)
			item.appendChild(elementContainer)
		}

		return root
	}

	const createArrayElement = (elements)=>{
		if (!Array.isArray(elements)) {
			throw new Error("elements is not an array");
		}
		const root = document.createElement('div')
		root.className = 'array'

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i]
			const item = document.createElement('div')
			item.className = 'index-value'
			root.appendChild(item)

			const indexElement = document.createElement('p')
			indexElement.className = 'array-index'
			indexElement.textContent = i
			item.appendChild(indexElement)

			const elementContainer = document.createElement('div')
			elementContainer.className = 'array-value'
			elementContainer.appendChild(element)
			item.appendChild(elementContainer)
		}
		
		return root
	}

	const createValueElement = (value)=>{
		const root = document.createElement('p')
		root.className = 'value'
		root.textContent = value
		return root
	}

	const recursiveFunction = (object, visited = new Set())=>{
		if (typeof object !== 'object') {
			return createValueElement(object)
		}
		visited.add(object)
		if (Array.isArray(object)) {
			return createArrayElement(object.map(element=>{
				if (visited.has(element)) {
					return createValueElement('visited')
				}
				return recursiveFunction(element, visited)
			}))
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
					elements.push(createValueElement('visited'))
				}else{
					elements.push(recursiveFunction(element, visited))
				}
			}
			return createObjectElement(elements, keys)
		}
	}
}




fetchJSON('structure.json').then(response=>{
	console.log(response)
	dataStructureContainer.appendChild(createHTMLStructure(response))
})