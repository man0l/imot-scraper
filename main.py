import requests
from bs4 import BeautifulSoup

# Base URL for the website
base_url = "https://www.imot.bg/pcgi/"

# Page URL
url = base_url + "imot.cgi?act=11&f1=1&f2=1"

# Send a GET request to the website
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the HTML content
    soup = BeautifulSoup(response.content, "html.parser")

    # Find the table cell that contains the property type links
    property_types_cell = soup.find("td", {"class": "borderDot", "align": "center"})

    # Find all the property type links in the table cell
    property_type_links = property_types_cell.select("a.qLinks12")

    # Prepare a dictionary to store property types and their corresponding links
    property_types_dict = {}

    # Iterate over the property type links and store them in the dictionary
    for link in property_type_links:
        # Get the property type
        property_type = link.text.strip()

        # Get the property type link
        property_type_link = base_url + link['href']

        # Store the property type and its link in the dictionary
        property_types_dict[property_type] = property_type_link

    # Print the property types and their links
    for property_type, link in property_types_dict.items():
        print(f"Property Type: {property_type}")
        print(f"Link: {link}")
        print()
else:
    print("Failed to retrieve the webpage. Status code:", response.status_code)
