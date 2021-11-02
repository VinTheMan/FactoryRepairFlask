# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt
RUN mkdir /storage
RUN mkdir /app/static
RUN mkdir /app/templates
RUN mkdir /app/conf
RUN mkdir /log
RUN apt-get update
RUN apt-get install net-tools -y
RUN apt-get install iputils-ping -y
RUN apt-get update && apt-get install -qq -y \
  build-essential libpq-dev php --no-install-recommends

# Make port 80 available to the world outside this container
#EXPOSE 80

# Define environment variable
#ENV NAME World

# Run app.py when the container launches
#CMD ["python", "app.py"]
CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:5000", "main:app"]
