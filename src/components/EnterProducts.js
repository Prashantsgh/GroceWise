import React, {useContext, useEffect, useState} from 'react';
import check from "../Controllers/CheckJwt";
import UserContext from "../context/UserContext";
import {getAllProducts} from "../Controllers/GetProductsDetails";
import url from "../url";
import BarcodeScanner from './BarcodeScanner';

function EnterProducts() {
    const context = useContext(UserContext);
    const {FlipLoginStats, allDetails, setCompleteDetails, showAlert} = context;
    const token = localStorage.getItem('authToken');
    // All use States
    const [details, setDetail] = useState({
        category: "", product_name: "", brand: "", price: "", Quantity: "", Remaining_quantity: ""
    });
    const [products, setProducts] = useState([]);
    const [unit, setUnit] = useState("");
    const [categories, setCategories] = useState([]);
    const [scanData, setscanData] = useState({});
    const [scanName, setScanName] = useState("");
    const [scanCategories, setScanCategories] = useState([]);
    const [catefound, setCatefound] = useState("");
    const [nutrifound, setnutrifound] = useState("");
    const [nutrients,setNutrients]=useState({});

    const scanning = (scan) => {
        setscanData({});
        setScanCategories([]);
        setCatefound("Categories Not Found");
        setnutrifound("Nutrients Value Not Found");
        let nutritemp={};
        if (scan.status_verbose === "product found") {
            for (const key in scan.product) {

                if (key === "nutriments") {
                    setscanData(scan.product.nutriments);
                    if (scan.product.nutriments.length !== 0)
                        for(const key2 in scan.product.nutriments){
                            if(key2==="carbohydrates"||key2==="fat"||key2==="proteins"||key2==="salt"||key2==="saturated-fat"||key2==="sodium"||key2==="sugars"){
                                nutritemp[key2]=scan.product.nutriments[key2];
                            }
                        }
                        setnutrifound("Nutrients");
                }
                if (key === "product_name") {
                    setScanName(scan.product.product_name);
                }
                if (key === "categories_tags_en") {
                    setScanCategories(scan.product.categories_tags_en);
                    if (scan.product.categories_tags_en.length !== 0)
                        setCatefound("Categories");
                }
            }
            setNutrients(nutritemp);
        } else {
            setScanName("Product Not found");
        }
        //console.log(nutritemp);
    }

    const onValueChange = (e) => {
        setDetail({...details, [e.target.name]: e.target.value});
    }

    const onCategorySelect = (e) => {
        setDetail({...details, [e.target.name]: e.target.value});
        const temp = categories.filter(x => x.category === e.target.value);
        setProducts(temp[0].items);
    }

    const onProductSelect = (e) => {
        setDetail({...details, [e.target.name]: e.target.value});
        const temp = products.filter(x => x.name === e.target.value);
        setUnit(temp[0].unit);
    }

    const fetchData = async () => {
        if (!allDetails) {
            try {
                getAllProducts(token).then(json => {
                    setCategories(json['Items']);
                    setCompleteDetails(json['Items']);
                })
            } catch (error) {
                console.log(error);
            }
        } else {
            setCategories(allDetails);
        }
    };

    const onDataSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${url}/product`, {
                method: "POST",
                headers: {
                    'content-Type': 'application/json',
                    authToken: localStorage.getItem('authToken')
                },
                body: JSON.stringify({
                    'category': details.category,
                    'brand': details.brand,
                    'price': Number(details.price),
                    'name': details.product_name,
                    'newQuantity': Number(details.Quantity),
                    'remainingQuantity': Number(details.Remaining_quantity),
                    'Nutrients':nutrients
                })
            });
            const json = await response.json();
            console.log(json);
            showAlert("Data Added Successfully", "success");
        } catch (error) {
            console.log(error);
            showAlert("Something went wrong", "danger");
        }
        setDetail({
            brand: "", price: "", Quantity: "", Remaining_quantity: ""
        });
    }

    useEffect(() => {
        if (!token) {
            FlipLoginStats(false);
        }
        check(token).then((res) => {
            if (!res) {
                FlipLoginStats(false);
            } else {
                FlipLoginStats(true);
                fetchData().then(() => {
                });
            }
        });
    }, []);


    const errorMessage = "* It is a required field and it should be a valid positive number";
    const errorMessage2 = "* It is a required field ";
    let require = true;
    // ^(0|[1-9][0-9]{0,9})$
    const [focus1, setFocus1] = useState(false);
    const [focus2, setFocus2] = useState(false);
    const [focus3, setFocus3] = useState(false);
    const [focus4, setFocus4] = useState(false);
    const [focus5, setFocus5] = useState(false);
    const handlefocus1 = () => {
        setFocus1(true);
    };
    const handlefocus2 = () => {
        setFocus2(true);
    };
    const handlefocus3 = () => {
        setFocus3(true);
    };
    const handlefocus4 = () => {
        setFocus4(true);
    };

    const handlefocus5 = () => {
        setFocus5(true);
    };

    const isvalid = () => {
        const regex = /^(0|[1-9][0-9]{0,9})$/;
        if (details.Quantity === "" || details.Remaining_quantity === "" || details.price === "" || details.category === "" || details.product_name === "") {
            setIssubmit(false);
        } else if (!regex.test(details.price) || !regex.test(details.Quantity) || regex.test(details.Remaining_quantity)) {
            setIssubmit(true);
        } else {
            setIssubmit(true);
        }
    }
    const [issubmit, setIssubmit] = useState(false);

    useEffect(() => {
        isvalid();
    }, [details])


    return (
        <div>
            <div className='EnterP'>
                <div className='e1'>
                    <div className='form-container'>
                        <form className="EnterProduct-Form">
                            {/*Select Category*/}
                            <div className="form-floating mb-3">
                                <select required={require} onBlur={handlefocus4} focused={focus4.toString()}
                                        onChange={onCategorySelect} id="category" className="form-select"
                                        name="category">
                                    <option value="">Select Category</option>
                                    {categories.map((data, index) => <option value={data.category}
                                                                             key={index}>{data.category}</option>)}
                                </select>
                                <label htmlFor="category">Category</label>
                                <span className='error'>{errorMessage2}</span>
                            </div>

                            {/*Select Product*/}
                            <div className="form-floating mb-3">
                                <select required={require} onBlur={handlefocus5} focused={focus5.toString()}
                                        onChange={onProductSelect} id="product" className="form-select"
                                        name="product_name">
                                    <option value="">Select Product</option>
                                    {products.map((data, index) => <option value={data.name}
                                                                           key={index}> {data.name} </option>)}
                                </select>
                                <label htmlFor="product">Products</label>
                                <span className='error'>{errorMessage2}</span>
                            </div>

                            {/*Enter Quantity*/}
                            <div className="form-floating mb-3">
                                <input pattern={"^(0|[1-9][0-9]{0,9})$"} required={require} onBlur={handlefocus1}
                                       focused={focus1.toString()} type="text" name="Quantity" id="quantity"
                                       placeholder='Not Used'
                                       onChange={onValueChange}
                                       value={details.Quantity}
                                       className="form-control"/>
                                <label htmlFor="quantity">Quantity in {unit}</label>
                                <span className='error'>{errorMessage}</span>
                            </div>

                            {/*Enter Brand*/}
                            <div className="form-floating mb-3">
                                <input type="text" name="brand" id="brand" placeholder='Not Used' value={details.brand}
                                       onChange={onValueChange}
                                       className="form-control"/>
                                <label htmlFor="brand">Brand</label>
                            </div>

                            {/*Enter Price*/}
                            <div className="form-floating mb-3">
                                <input pattern={"^(0|[1-9][0-9]{0,9})$"} onBlur={handlefocus2}
                                       focused={focus2.toString()}
                                       required={require} type="text" name="price" id="price" placeholder="Not Used"
                                       value={details.price}
                                       onChange={onValueChange}
                                       className="form-control"/>
                                <label htmlFor="price">Price</label>
                                <span className='error'>{errorMessage}</span>
                            </div>

                            {/*Enter Remaining Quantity*/}
                            <div className="form-floating mb-3">
                                <input pattern={"^(0|[1-9][0-9]{0,9})$"} onBlur={handlefocus3}
                                       focused={focus3.toString()}
                                       required={require} type="text" name="Remaining_quantity" id="remain"
                                       value={details.Remaining_quantity}
                                       onChange={onValueChange} className="form-control"
                                       placeholder='Qunatity left in Home'/>
                                <label htmlFor="remain">Quantity in your House Left</label>
                                <span className='error'>{errorMessage}</span>
                            </div>

                            {/*Submit Details*/}
                            <button type="button" disabled={!issubmit} onClick={onDataSubmit}
                                    className="btn btn-dark btn-block mb-4">Submit Details
                            </button>

                        </form>
                    </div>
                </div>
                <div className="e2">
                    <BarcodeScanner scanning={scanning}/>
                </div>
            </div>
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "-250px"
            }}>
                <div>
                    <h2 style={{color: "white"}}>{scanName}</h2>
                    <h4 style={{color: "yellow"}}>{catefound}</h4>
                    <table className="table">
                        <tbody>
                        {scanCategories.map((value, ind) => (

                                <tr key={ind}>
                                    <td>{value}</td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                    <h4 style={{color: "yellow"}}>{nutrifound}</h4>
                    <table className="table">
                        <tbody>
                        {Object.keys(scanData).map((keyName, i) => (
                            <tr key={i}>
                                <td>{keyName}</td>
                                <td>{" " + scanData[keyName]}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default EnterProducts;