import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { usePlaylistContext } from '../../pages/PlaylistPage';
import '../../styles/playlistPage/ImageGallery.css';

function ImageGallery ({setIsVisible, isVisible, handleImageSelected, selectedImage}) {
    const [images, setImages] = useState(['/images/default.jpg', '/images/congrats.png', '/images/good-luck.png', '/images/happybirthday.jpg']);
    const [uploaded, setUploaded] = useState(null);
    const { playlistId, baseUrl } = usePlaylistContext();

    useEffect(() => {
        if (selectedImage.startsWith('/uploads-')) {
            const imageSrc = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${selectedImage}`;
            setUploaded(true);
            setImages(prevImages => [...prevImages, imageSrc]);
        }
    }, [selectedImage, baseUrl]);
    
    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (uploaded != null) {
                images.pop();
            }
            setUploaded(file);
            const uploadedImage = URL.createObjectURL(file);
            console.log('uploaded: ', uploadedImage);
            handleImageSelected(uploadedImage);
            console.log(selectedImage);
            setImages((prevImages) => [...prevImages, uploadedImage]);
        }
    }

    const closeModal = async (imageName) => {
        setIsVisible(false);
        handleImageSelected(imageName);
        if (selectedImage !== null) {
            if (imageName.startsWith('/images')) {
                try {
                    const response = await fetch(baseUrl + `/select-image/${playlistId}`, {
                        method: 'POST',
                        body: JSON.stringify({imageName: imageName}),
                        headers:{
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        console.error('Failed sending image name to server');
                    }
                } catch (error) {
                    console.error(`Error uploading image name : `+ error );
                    alert('Sending image name failed.');
                }

            }  else if (!imageName.includes('/uploads-')){

                const formData = new FormData();
                formData.append('image', uploaded);
                console.log('Form data: ', formData);
                try {
                    const response = await fetch(baseUrl + `/upload-image/${playlistId}`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        console.error('Error uploading image to server');
                    }
                } catch (error) {
                    console.error(`Error uploading image : `+ error );
                    alert(' Uploading image failed.');
                }
            }
        }
    }

   return (!isVisible ? null :
        (
            <div className='image-gallery-container'>
                <div className='image-gallery-modal'>

                    <div className='images-container ' style={{marginTop:'27px'}}>
                        {images.map((image, index) => (
                            <div key={index} className={`thumbanil ${selectedImage === image? 'selected' : ''}`}
                             onClick={() => closeModal(image)} >
                                <img key={index}  src={image} alt={`Image ${index}`} />
                            </div>
                        ))}
                        {process.env.ALLOW_IMAGE_UPLOAD === "true" && 
                            <label className='thumbnail' style={{width:'100%'}} > 
                            <FontAwesomeIcon icon={faSquarePlus} style={{height: '2rem'}}/>
                            <input 
                                type='file'
                                name='image'
                                id='image-input'
                                style={{display: 'none'}}
                                accept='image/*'
                                onChange={handleUploadImage}
                            />
                        </label>}
                    </div>

                </div>
            </div>
        )
    )
}

export default ImageGallery;