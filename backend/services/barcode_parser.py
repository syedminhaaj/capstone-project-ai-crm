import re

def parse_pdf417_barcode(raw_data: str) -> dict:
    """
    Parse PDF417 barcode data from driver's license
    Standard AAMVA format
    """
    result = {
        "name": "",
        "license_number": "",
        "date_of_birth": "",
        "address": "",
    }
    
    # Extract First Name (DCT)
    first_name = ""
    m_first = re.search(r"DCT([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw_data, re.MULTILINE)
    if m_first:
        first_name = m_first.group(1).strip()
    
    # Extract Last Name (DCS)
    last_name = ""
    m_last = re.search(r"DCS([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw_data, re.MULTILINE)
    if m_last:
        last_name = m_last.group(1).strip()
    
    # Extract Middle Name (DAD)
    middle_name = ""
    m_middle = re.search(r"DAD([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw_data, re.MULTILINE)
    if m_middle:
        middle_name = m_middle.group(1).strip()
    
    # Combine name
    if first_name and last_name:
        result["name"] = f"{first_name} {middle_name} {last_name}".strip() if middle_name else f"{first_name} {last_name}"
    
    # Extract License Number (DAQ)
    m_lic = re.search(r"DAQ([A-Z0-9]+?)(?=\n|D[A-Z]{2})", raw_data, re.MULTILINE)
    if m_lic:
        result["license_number"] = m_lic.group(1).strip()
    
    # Extract DOB (DBB format: MMDDYYYY or YYYYMMDD)
    m_dob = re.search(r"DBB(\d{8})", raw_data)
    if m_dob:
        dob_str = m_dob.group(1)
        # Try YYYYMMDD format first
        if dob_str[:4].isdigit() and int(dob_str[:4]) > 1900:
            result["date_of_birth"] = f"{dob_str[:4]}-{dob_str[4:6]}-{dob_str[6:]}"
        else:
            # MMDDYYYY format
            result["date_of_birth"] = f"{dob_str[4:]}-{dob_str[:2]}-{dob_str[2:4]}"
    
    # Extract Address Components
    street = city = state = zip_code = ""
    
    # Street Address (DAG)
    m_street = re.search(r"DAG([A-Z0-9\s]+?)(?=\n|D[A-Z]{2})", raw_data, re.MULTILINE)
    if m_street:
        street = m_street.group(1).strip()
    
    # City (DAI)
    m_city = re.search(r"DAI([A-Z\s]+?)(?=\n|D[A-Z]{2})", raw_data, re.MULTILINE)
    if m_city:
        city = m_city.group(1).strip()
    
    # State (DAJ)
    m_state = re.search(r"DAJ([A-Z]{2})", raw_data)
    if m_state:
        state = m_state.group(1).strip()
    
    # ZIP (DAK)
    m_zip = re.search(r"DAK(\d{5,9})", raw_data)
    if m_zip:
        zip_code = m_zip.group(1).strip()[:5]
    
    # Combine address
    address_parts = [p for p in [street, city, state, zip_code] if p]
    if address_parts:
        result["address"] = ", ".join(address_parts)
    
    return result