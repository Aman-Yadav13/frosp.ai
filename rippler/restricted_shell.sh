#!/bin/bash

WORKSPACE="/workspace"

while true; do
    # Prompt for user input
    echo -n "$PWD$ "  # Display current directory
    read -r cmd

    # Extract the first word (command name)
    first_word=$(echo "$cmd" | awk '{print $1}')

    # Block 'cd ..' and attempts to move above /workspace
    if [[ "$first_word" == "cd" ]]; then
        new_dir=$(echo "$cmd" | awk '{print $2}')

        # If no argument, cd to $HOME (/workspace)
        if [[ -z "$new_dir" ]]; then
            cd "$WORKSPACE"
        elif [[ "$new_dir" == ".." ]] || [[ "$new_dir" == "/" ]] || [[ "$new_dir" == /* ]] || [[ "$PWD/$new_dir" == *"/workspace/.."* ]]; then
            echo "Access Denied: You cannot move above /workspace."
        else
            cd "$new_dir" 2>/dev/null || echo "No such directory: $new_dir"
        fi
    else
        # Execute allowed commands
        eval "$cmd"
    fi
done
