# juice groove sbp generator

To setup python for this project:

1. Activate the python virtual environment (the command below works in git bash
   on windows):
    ```sh
    source ./.venv/Scripts/activate
    ```
2. Install packages
    ```sh
    python -m pip install -r requirements.txt
    ```

Later, when you're done developing on this project, run the following to
deactive the python virtual environment:

```sh
deactivate
```

It's important to do this before switching to another project and installing
dependencies, otherwise any python packages you install in that other
environment might get muddled up with this project's dependencies.

To add new dependencies (replace `some-package` in the commands below with the
package(s) you want to install):

1. Activate the virtual environment per the instructions above
2. Install your dependencies
    ```sh
    python -m pip install some-package
    ```
3. Update the `requirements.txt` file:
    ```sh
    python -m pip freeze > requirements.txt
    ```
4. Double check that the changes to `requirements.txt` make sense:
    ```sh
    git diff requirements.txt
    ```
5. Commit your changes to `requirements.txt`:
    ```sh
    git add requirements.txt
    git commit -m 'adds python package "some-package"'
    ```
