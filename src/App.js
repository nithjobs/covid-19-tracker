import React , {useState , useEffect } from "react";
import { MenuItem , FormControl , Select, Card, CardContent} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import "./App.css";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

// import {prettyPrintStat} from "./util";


function App(){

    // var latt = 0;
    // var longg=0;
    
    // if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(position);
    // }
    // function showPosition(position) {
    //         latt = position.coords.latitude;  
    //         longg= position.coords.longitude;
            
    //   } 

    

    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState("worldwide");
    const [countryInfo, setCountryInfo] =useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState({lat:20.5937, lng:78.9629});
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType,setCasesType] = useState("cases");
    

    
    
    //sorts data in the table(sorts)
    const sortData =(data) => {
        const sortedData = [...data];
    
        sortedData.sort((a,b) => {
            if (a.cases > b.cases){
                return -1;
            }else{
                return 1;
            }
        })
        return sortedData;
    };


    //prettyprintstat
    // const prettyPrintStat =(stat) => 
    // stat ? '{numeral(stat).format("0.0a")}' : "+0";



    useEffect(() => {
        fetch("https://disease.sh/v3/covid-19/all")
        .then(response => response.json())
        .then(data => {
            setCountryInfo(data);    
        })
    },[])



    // use effect for fetching countries name in dropdown 
    useEffect(() => {
        const getCountriesData = async () => {
            await fetch("https://disease.sh/v3/covid-19/countries")
            .then((response) => response.json())
            .then((data) => {
                const countries = data.map((country) => ({
                    name:country.country,
                    value: country.countryInfo.iso2
                }));

                const sortedData = sortData(data);
                setTableData(sortedData);
                setMapCountries(data);
                setCountries(countries);
            });
        };
        getCountriesData();
    },[]);
    const onCountryChange = async (event) => {
        const countryCode = event.target.value;
        setCountry(countryCode);
        const url = countryCode === "worldwide" 
        ? "https://disease.sh/v3/covid-19/all" 
        : "https://disease.sh/v3/covid-19/countries/"+countryCode ;

        await fetch(url)
        .then(response => response.json())
        .then(data => {
            setCountry(countryCode);
            setCountryInfo(data);

            setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
            setMapZoom(4);
        })
     };
    
    
    return (
        <div className="app">

      

        <div className="app__left">
        
        <div className="app__header">
                <h1>COVID-19 TRACKER </h1>
                <FormControl className="app__dropdown">
                <Select variant="outlined" onChange={onCountryChange} value={country}>

                   <MenuItem value="worldwide">Worldwide</MenuItem>
                    {
                        countries.map((country) => (
                            <MenuItem value={country.value}>{country.name}</MenuItem>  
                        ))
                    }
                </Select>
                </FormControl>
            </div>
                    
            <div className="app__stats">
                <InfoBox active={casesType === "cases"} onClick={e => setCasesType('cases')} title="Coronavirus Cases"  cases={numeral(countryInfo.todayCases).format("0.0a")} total={numeral(countryInfo.cases).format("0.0a")}/>
                <InfoBox active={casesType === "recovered"} onClick={e => setCasesType('recovered')} title="Recovered"  cases={numeral(countryInfo.todayRecovered).format("0.0a")}total={numeral(countryInfo.recovered).format("0.0a")}/>
                <InfoBox active={casesType === "deaths"} onClick={e => setCasesType('deaths')} title="Deaths" cases={numeral(countryInfo.todayDeaths).format("0.0a")} total={numeral(countryInfo.deaths).format("0.0a")}/>                    
            </div>
        
        
        
        {/* Map */}
                <Map 
                    casesType={casesType}
                    countries={mapCountries}
                    center={mapCenter}
                    zoom={mapZoom}
                />
        </div>

        <Card className="app__right">
            <CardContent>
            <h3>Live Cases by Country</h3>

            
            <Table countries={tableData} />

            <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
                    
            <LineGraph className="app__graph" casesType={casesType}/>


            </CardContent>

        </Card>
        
        
        
    </div>
            
    );
}
export default App;