/* CS 405 Project 2 - Kerem Tatari 29208 */

// This code handles rendering 3D meshes using WebGL with support for textures and lighting.
// It includes functions to load vertex data, apply textures (including non-power-of-2 textures), 
// and implement basic lighting with ambient, diffuse, and specular components, controlled via uniforms.

/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');


		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.numTriangles = 0;

		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal'); // Get normal attribute location
		this.normalbuffer = gl.createBuffer(); // Create a buffer for normals

		// Lighting uniform locations
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos'); // Location of light position uniform
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient'); // Location of ambient light uniform
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting'); // Location to enable/disable lighting with button in the HTML

		// For Task 3: Setting up shininess and view position uniforms
		this.viewPosLoc = gl.getUniformLocation(this.prog, 'viewPos'); // Location for view position uniform
		this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess'); // Location for shininess uniform
		this.shininess = 32.0; // Default value for shininess

		this.specularIntensity = 0.5; // Default specular intensity value
		gl.useProgram(this.prog);
		gl.uniform1f(gl.getUniformLocation(this.prog, 'specularIntensity'), this.specularIntensity); // Set the specular intensity uniform

	
		// Initialize default lighting values
		this.lightPos = [1.0, 1.0, 1.0];  // Light position in 3D space
		this.ambient = 0.2; // Default ambient light strength
		this.ambientIntensity = 0.5; // Ambient intensity
		this.specularIntensity = 0.5; // Specular light intensity
		this.viewDir = [0.0, 0.0, 1.0]; // Default camera/view direction

	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */
		
		// Bind the normal buffer and upload the normal coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

		// Set initial lighting values in the shader
		gl.useProgram(this.prog);
		gl.uniform3fv(this.lightPosLoc, this.lightPos); // Set the position of the light
		gl.uniform1f(this.ambientLoc, this.ambient);   // Set the intensity of the ambient light
		gl.uniform1f(this.shininessLoc, this.shininess); // Set the shininess of the material
		gl.uniform1i(this.enableLightingLoc, true);    // Enable lighting in the shader
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */

		///////////////////////////////
	
		gl.uniform3fv(this.lightPosLoc, [lightX, lightY, 1.0]); // Light position
		gl.uniform3fv(this.viewPosLoc, [0.0, 0.0, 5.0]);       // Camera position
		gl.uniform1f(this.shininessLoc, this.shininess);       // Shininess value
	
		gl.uniform1f(this.ambientLoc, this.ambient);           // Ambient light intensity
	
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);

		gl.uniform1f(gl.getUniformLocation(this.prog, 'specularIntensity'), this.specularIntensity);

	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			// console.error("Task 1: Non power of 2, you should implement this part to accept non power of 2 sized textures");
			/**
			 * @Task1 : You should implement this part to accept non power of 2 sized textures
			 */
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}

		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	// For Task 3
	setShininess(shininess) {
		gl.useProgram(this.prog);                       // Use the current shader program
		gl.uniform1f(this.shininessLoc, shininess);     // Update shininess uniform in shader
		this.shininess = shininess;                    // Update local shininess variable
	}

	SetSpecularLight(intensity) {
		this.specularIntensity = intensity; // Update local value
		gl.useProgram(this.prog);
		gl.uniform1f(gl.getUniformLocation(this.prog, 'specularIntensity'), intensity); // Pass to shader
	}
	
	enableLighting(show) {
		// console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		gl.useProgram(this.prog);

		// Set the enableLighting uniform in the shader
		gl.uniform1i(this.enableLightingLoc, show ? 1 : 0);
	}
	
	setAmbientLight(ambient) {
		// console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */

		gl.useProgram(this.prog);

		// Set the ambient uniform in the shader
		gl.uniform1f(this.ambientLoc, ambient);
	
		// Update the local variable for consistency
		this.ambient = ambient;
	}
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			varying vec3 v_fragPos;

			void main()
			{
				v_texCoord = texCoord;
				v_normal = normal;

				v_fragPos = pos;

				gl_Position = mvp * vec4(pos, 1.0);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */

const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex;
			uniform vec3 color; // Default color for non-textured rendering
			uniform vec3 viewPos;  // Position of the camera/viewer
			uniform vec3 lightPos; // Position of the light source
			uniform float ambient; // Ambient light intensity
			uniform float shininess; // Shininess factor for specular highlights
			uniform float specularIntensity; // Intensity of specular highlights

			varying vec2 v_texCoord;
			varying vec3 v_normal;

			varying vec3 v_fragPos;

			void main() {
				vec4 finalColor = texture2D(tex, v_texCoord); // Default texture color
				vec3 fragPos = v_fragPos;

				if (showTex && enableLighting) {
					// Normalize the normal vector
					vec3 normal = normalize(v_normal);

					// Get the fragment position and light direction
					vec3 fragPos = v_fragPos;
					vec3 lightDir = normalize(lightPos - fragPos); // Direction of the light to the fragment

					// Calculate the ambient light contribution
					vec3 ambient_light = ambient * finalColor.rgb;

					// Calculate diffuse lighting (basic lighting depending on the angle between normal and light direction)
					float diff = max(dot(normal, lightDir), 0.0);
					vec3 diffuse = diff * finalColor.rgb;

					// Calculate the view direction and reflection direction for specular lighting
					vec3 viewDir = normalize(viewPos - fragPos);
					vec3 reflectDir = reflect(-lightDir, normal);
					float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
					vec3 specular = specularIntensity * spec * vec3(1.0, 1.0, 1.0);

					// Combine all lighting components (ambient, diffuse, and specular) to get the final color
					vec3 result = ambient_light + diffuse + specular;
					gl_FragColor = vec4(result, finalColor.a); // Output the final color with the original alpha value

				} else if (showTex) {
					gl_FragColor = finalColor;
				} else {
					gl_FragColor = vec4(color, 1.0);
				}
			}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////